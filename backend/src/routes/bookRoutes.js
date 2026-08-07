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
            status: "published",
            salesCount: 0
        });

        await newPDF.save();
        res.status(201).json(newPDF);
    } catch (error) {
        console.error("Error creating PDF listing:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 2. Get PDFs with pagination and filters
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.status) {
            filter.status = req.query.status;
        } else {
            filter.status = "published";
        }

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

        if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
            filter.price = {};
            if (req.query.minPrice !== undefined) filter.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice !== undefined) filter.price.$lte = parseFloat(req.query.maxPrice);
        }

        if (req.query.language) {
            filter.language = req.query.language;
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

// 3. Get a single PDF by ID
router.get("/:id", async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id)
            .populate("user", "username profileImage storeName bio");

        if (!pdf) return res.status(404).json({ message: "PDF not found" });

        let hasAccess = false;
        if (req.user) {
            hasAccess = pdf.user._id.toString() === req.user._id.toString();
        }

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

        if (pdf.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to modify this listing" });
        }

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

// 6. Increment sales count
router.patch("/:id/sales", protectRoute, async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);

        if (!pdf) return res.status(404).json({ message: "PDF not found" });

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

// 7. Delete a PDF listing
router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);
        if (!pdf) return res.status(404).json({ message: "PDF listing not found" });

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