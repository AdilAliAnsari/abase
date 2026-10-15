import express from "express";
import mongoose from "mongoose";
import PDF from "../models/PDF.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { protectRoute } from "./auth.js";

const router = express.Router();

// Distributor creates and publishes a PDF listing.
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, author, price, description, coverImage, pdfFileUrl, category, tags, pageCount,
      language, previewPages, drmEnabled, subjectCode, scheme, branch, year, semester, university,
      materialType, fileSize } = req.body;
    if (!title?.trim() || price === undefined || !pdfFileUrl?.trim()) {
      return res.status(400).json({ success: false, message: "Title, price, and PDF URL are required." });
    }
    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: "Price must be a non-negative number." });
    }

    const pdf = await PDF.create({
      title: title.trim(), author: author?.trim() || "Unknown", price: Number(price), description,
      coverImage, pdfFileUrl: pdfFileUrl.trim(), category, tags: Array.isArray(tags) ? tags : [],
      pageCount: pageCount ? Number(pageCount) : 1, language: language || "en",
      previewPages: previewPages ? Number(previewPages) : 0, drmEnabled: Boolean(drmEnabled),
      subjectCode, scheme, branch, year, semester: semester ? Number(semester) : undefined,
      university, materialType, fileSize, user: req.user._id, status: "published", salesCount: 0,
    });

    const customers = await User.find({ _id: { $ne: req.user._id }, role: "user" }).select("_id").lean();
    if (customers.length) {
      const message = `New study material "${pdf.title}" by ${pdf.author} is now available.`;
      await Notification.insertMany(customers.map(customer => ({
        user: customer._id, title: "New PDF uploaded", message, type: "pdf", pdf: pdf._id,
      })));
    }
    return res.status(201).json({ success: true, pdf, notificationsCreated: customers.length, message: "PDF published and customers notified." });
  } catch (error) {
    console.error("Error creating PDF listing:", error);
    return res.status(500).json({ success: false, message: "Could not publish PDF." });
  }
});

// Customer library: published PDFs only.
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, pdfs: [], totalPages: 1, currentPage: 1, totalItems: 0, message: "Database is offline/connecting." });
    }
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const filter = { status: "published" };
    if (req.query.search) {
      const safeSearch = String(req.query.search).replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safeSearch, "i");
      filter.$or = [{ title: regex }, { author: regex }, { description: regex }, { tags: regex }, { subjectCode: regex }];
    }
    if (req.query.category) filter.category = new RegExp(String(req.query.category), "i");
    if (req.query.tags) filter.tags = { $in: String(req.query.tags).split(",").map(tag => tag.trim()) };
    if (req.query.language) filter.language = String(req.query.language);
    const [pdfs, totalItems] = await Promise.all([
      PDF.find(filter).populate("user", "username profileImage storeName").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      PDF.countDocuments(filter),
    ]);
    res.json({ success: true, pdfs, totalPages: Math.ceil(totalItems / limit), currentPage: page, totalItems });
  } catch (error) {
    console.error("Error getting PDF listings:", error);
    res.status(500).json({ success: false, message: "Could not load PDFs." });
  }
});

// Current distributor's own listings.
router.get("/user/mystore", protectRoute, async (req, res) => {
  try {
    const pdfs = await PDF.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, pdfs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not load your PDFs." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pdf = await PDF.findOne({ _id: req.params.id, status: "published" }).populate("user", "username profileImage storeName bio");
    if (!pdf) return res.status(404).json({ success: false, message: "PDF not found." });
    res.json({ ...pdf.toObject(), uploadedAt: pdf.createdAt });
  } catch {
    res.status(400).json({ success: false, message: "Invalid PDF ID." });
  }
});

// Update own listing.
router.put("/:id", protectRoute, async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: "PDF listing not found" });
    if (pdf.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized to modify this listing" });
    const fields = ["title", "author", "price", "description", "coverImage", "pdfFileUrl", "category", "tags", "pageCount", "language", "previewPages", "drmEnabled", "status", "subjectCode", "scheme", "branch", "year", "semester", "university", "materialType", "fileSize"];
    for (const field of fields) if (req.body[field] !== undefined) pdf[field] = req.body[field];
    await pdf.save();
    res.json({ success: true, pdf });
  } catch (error) {
    console.error("Error updating PDF listing:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Increment sales count.
router.patch("/:id/sales", protectRoute, async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: "PDF not found" });
    if (pdf.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized" });
    pdf.salesCount += 1;
    await pdf.save();
    res.json({ salesCount: pdf.salesCount });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Add/update average rating.
router.post("/:id/reviews", protectRoute, async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be between 1 and 5" });
    const pdf = await PDF.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: "PDF not found" });
    const count = (pdf.reviewCount || 0) + 1;
    pdf.rating = Math.round((((pdf.rating || 0) * (pdf.reviewCount || 0) + Number(rating)) / count) * 10) / 10;
    pdf.reviewCount = count;
    await pdf.save();
    res.status(201).json({ rating: pdf.rating, reviewCount: pdf.reviewCount });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete own listing.
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: "PDF listing not found" });
    if (pdf.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized to delete this listing" });
    await PDF.findByIdAndDelete(req.params.id);
    res.json({ message: "PDF listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
