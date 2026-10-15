import express from "express";
import mongoose from "mongoose";
import PDF from "../models/PDF.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { protectRoute } from "./auth.js";

const router = express.Router();

// Create a published PDF listing. The client sends its secure Cloudinary/object-storage URL.
router.post("/", protectRoute, async (req, res) => {
  try {
    const {
      title, author, price, description, coverImage, pdfFileUrl,
      category, tags, pageCount, language, previewPages, drmEnabled,
      subjectCode, scheme, branch, year, semester, university, materialType, fileSize
    } = req.body;

    if (!title?.trim() || price === undefined || !pdfFileUrl?.trim()) {
      return res.status(400).json({ success: false, message: "Title, price, and PDF URL are required." });
    }
    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: "Price must be a non-negative number." });
    }

    const newPDF = await PDF.create({
      title: title.trim(), author: author?.trim() || "Unknown", price: Number(price),
      description, coverImage, pdfFileUrl: pdfFileUrl.trim(), category,
      tags: Array.isArray(tags) ? tags : [], pageCount: pageCount ? Number(pageCount) : 1,
      language: language || "en", previewPages: previewPages ? Number(previewPages) : 0,
      drmEnabled: Boolean(drmEnabled), subjectCode, scheme, branch, year,
      semester: semester ? Number(semester) : undefined, university, materialType, fileSize,
      user: req.user._id, status: "published", salesCount: 0,
    });

    // Create persistent in-app notifications for other customer accounts.
    const customers = await User.find({ _id: { $ne: req.user._id }, role: "user" }).select("_id").lean();
    if (customers.length) {
      const message = `New study material "${newPDF.title}" by ${newPDF.author} is now available.`;
      await Notification.insertMany(customers.map(customer => ({
        user: customer._id, title: "New PDF uploaded", message, type: "pdf", pdf: newPDF._id,
      })));
    }

    return res.status(201).json({
      success: true, pdf: newPDF, notificationsCreated: customers.length,
      message: "PDF published and customers notified.",
    });
  } catch (error) {
    console.error("Error creating PDF listing:", error);
    return res.status(500).json({ success: false, message: "Could not publish PDF." });
  }
});

// List published PDFs for the customer library
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, pdfs: [], totalPages: 1, currentPage: 1, totalItems: 0, message: "Database is offline/connecting." });
    }
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const filter = { status: "published" };

    if (req.query.search) {
      const safeSearch = String(req.query.search).replace(/[.*+?^${}()|[]\]/g, "\$&");
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

router.get("/user/mystore", protectRoute, async (req, res) => {
  try {
    const pdfs = await PDF.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, pdfs });
  } catch (error) {
    console.error("Error getting seller PDFs:", error);
    res.status(500).json({ success: false, message: "Could not load your PDFs." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pdf = await PDF.findOne({ _id: req.params.id, status: "published" }).populate("user", "username profileImage storeName");
    if (!pdf) return res.status(404).json({ success: false, message: "PDF not found." });
    res.json({ ...pdf.toObject(), uploadedAt: pdf.createdAt });
  } catch {
    res.status(400).json({ success: false, message: "Invalid PDF ID." });
  }
});

export default router;
