import express from "express";
import PDF from "../models/PDF.js";
import { protectRoute } from "./auth.js";

const router = express.Router();

// 1. Create a PDF listing for sale
router.post("/", protectRoute, async (req, res) => {
    try {
        const {
            title,
            author,
            price,
            description,
            coverImage,
            pdfFileUrl,
            category,
            tags,
            pageCount,
            language,
            previewPages,
            drmEnabled
        } = req.body;

        if (!title || price === undefined || !pdfFileUrl) {
            return res.status(400).json({
                message: "Title, Price, and PDF file URL are required fields."
            });
        }

        const newPDF = new PDF({
            title,
            author,
            price,
            description,
            coverImage,
            pdfFileUrl,
            category,
            tags,
            pageCount,
            language,
            previewPages: previewPages || 0,
            drmEnabled: drmEnabled || false,
            user: req.user._id,
            status: "published", // published, draft, archived
            salesCount: 0,
            rating: 0,
            reviewCount: 0
        });

        await newPDF.save();
        res.status(201).json(newPDF);
    } catch (error) {
        console.error("Error creating PDF listing:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 2. Get PDFs with pagination and filters (search, category, tags, price range, status)
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Build query filters
        const filter = {};

        // Only show published PDFs by default
        if (req.query.status) {
            filter.status = req.query.status;
        } else {
            filter.status = "published";
        }

        // Text search across title, author, description, tags
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, "i");
            filter.$or = [
                { title: searchRegex },
                { author: searchRegex },
                { description: searchRegex },
                { tags: searchRegex }
            ];
        }

        if (req.query.category) {
            filter.category = new RegExp(req.query.category, "i");
        }

        if (req.query.tags) {
            const tagArray = req.query.tags.split(",").map(tag => tag.trim());
            filter.tags = { $in: tagArray };
        }

        // Price range filter
        if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
            filter.price = {};
            if (req.query.minPrice !== undefined) filter.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice !== undefined) filter.price.$lte = parseFloat(req.query.maxPrice);
        }

        // Language filter
        if (req.query.language) {
            filter.language = req.query.language;
        }

        // Rating filter
        if (req.query.minRating) {
            filter.rating = { $gte: parseFloat(req.query.minRating) };
        }

        const pdfs = await PDF.find(filter)
            .sort({
                [req.query.sortBy || "createdAt"]: req.query.sortOrder === "asc" ? 1 : -1
            })
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage storeName");

        const totalPDFs = await PDF.countDocuments(filter);

        res.status(200).json({
            pdfs,
            totalPages: Math.ceil(totalPDFs / limit),
            currentPage: page,
            totalItems: totalPDFs
        });
    } catch (error) {
        console.error("Error getting PDF listings:", error);
        res.status(500).json({ message: "Error in getting PDF listings" });
    }
});

// 3. Get a single PDF by ID (with access check for purchased/download)
router.get("/:id", async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id)
            .populate("user", "username profileImage storeName bio");

        if (!pdf) return res.status(404).json({ message: "PDF not found" });

        // If user is logged in, check if they own or purchased this PDF
        let hasAccess = false;
        if (req.user) {
            hasAccess = pdf.user._id.toString() === req.user._id.toString();
            // You could also check a Purchase model here
            // hasAccess = await Purchase.exists({ user: req.user._id, pdf: pdf._id });
        }

        // If no access, don't return the actual file URL
        const pdfResponse = {
            ...pdf.toObject(),
            pdfFileUrl: hasAccess ? pdf.pdfFileUrl : undefined,
            previewOnly: !hasAccess
        };

        res.status(200).json(pdfResponse);
    } catch (error) {
        console.error("Error getting PDF:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 4. Get PDFs listed by the current logged-in user (seller dashboard)
router.get("/user/mystore", protectRoute, async (req, res) => {
    try {
        const pdfs = await PDF.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.status(200).json(pdfs);
    } catch (error) {
        console.error("Error getting seller PDF listings:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 5. Update a PDF listing
router.put("/:id", protectRoute, async (req, res) => {
    try {
        const {
            title, author, price, description, coverImage,
            pdfFileUrl, category, tags, pageCount, language,
            previewPages, drmEnabled, status
        } = req.body;

        const pdf = await PDF.findById(req.params.id);

        if (!pdf) return res.status(404).json({ message: "PDF listing not found" });

        // Ensure current user is the owner/seller
        if (pdf.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to modify this listing" });
        }

        // Apply updates
        if (title !== undefined) pdf.title = title;
        if (author !== undefined) pdf.author = author;
        if (price !== undefined) pdf.price = price;
        if (description !== undefined) pdf.description = description;
        if (coverImage !== undefined) pdf.coverImage = coverImage;
        if (pdfFileUrl !== undefined) pdf.pdfFileUrl = pdfFileUrl;
        if (category !== undefined) pdf.category = category;
        if (tags !== undefined) pdf.tags = tags;
        if (pageCount !== undefined) pdf.pageCount = pageCount;
        if (language !== undefined) pdf.language = language;
        if (previewPages !== undefined) pdf.previewPages = previewPages;
        if (drmEnabled !== undefined) pdf.drmEnabled = drmEnabled;
        if (status !== undefined) pdf.status = status;

        await pdf.save();
        res.status(200).json(pdf);
    } catch (error) {
        console.error("Error updating PDF listing:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 6. Increment sales count (called after successful purchase)
router.patch("/:id/sales", protectRoute, async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);

        if (!pdf) return res.status(404).json({ message: "PDF not found" });

        // Only the seller or admin can update sales count
        if (pdf.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        pdf.salesCount += 1;
        await pdf.save();

        res.status(200).json({ salesCount: pdf.salesCount });
    } catch (error) {
        console.error("Error updating sales count:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 7. Add a review/rating to a PDF
router.post("/:id/reviews", protectRoute, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const pdf = await PDF.findById(req.params.id);
        if (!pdf) return res.status(404).json({ message: "PDF not found" });

        // Add review logic here (you'd typically have a separate Review model)
        // For simplicity, updating average rating
        const newReviewCount = pdf.reviewCount + 1;
        const newRating = ((pdf.rating * pdf.reviewCount) + rating) / newReviewCount;

        pdf.rating = Math.round(newRating * 10) / 10;
        pdf.reviewCount = newReviewCount;

        await pdf.save();
        res.status(201).json({ rating: pdf.rating, reviewCount: pdf.reviewCount });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 8. Delete a PDF listing
router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);
        if (!pdf) return res.status(404).json({ message: "PDF listing not found" });

        // Ensure current user is the owner/seller
        if (pdf.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this listing" });
        }

        await PDF.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "PDF listing deleted successfully" });
    } catch (error) {
        console.error("Error deleting PDF listing:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;