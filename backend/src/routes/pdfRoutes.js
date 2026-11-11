import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import PDF from "../models/PDF.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { protectRoute } from "./auth.js";
import { scanPDFsFolder, getPDFsRootDir } from "../services/pdfScanner.js";

const router = express.Router();

/**
 * Authorization helper for scanner endpoint
 * Allows admins, distributors, or local development requests
 */
const authorizeScanner = async (req, res, next) => {
    // 1. Try protectRoute if auth header present
    const authHeader = req.headers.authorization || req.headers["x-auth-token"];
    if (authHeader) {
        return protectRoute(req, res, () => {
            const role = req.user?.role;
            if (role === "admin" || role === "distributor" || req.user) {
                return next();
            }
            return res.status(403).json({
                success: false,
                message: "Forbidden - Administrator or Distributor access required to run PDF scanner"
            });
        });
    }

    // 2. Allow in local development mode or from localhost
    const clientIp = req.ip || req.connection?.remoteAddress || "";
    const isLocalhost = clientIp.includes("127.0.0.1") || clientIp.includes("::1") || clientIp.includes("localhost");
    if (process.env.NODE_ENV !== "production" || isLocalhost) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: "Unauthorized - Authentication required to run PDF scan"
    });
};

// ==========================================
// 1. Scan Local PDFs Folder
// ==========================================
router.post("/scan", authorizeScanner, async (req, res) => {
    try {
        console.log(`[PDF Routes] Manual scan requested by user ${req.user?.username || "Admin/Local"}`);
        const result = await scanPDFsFolder("api-manual-scan");
        res.status(200).json({
            success: true,
            message: "Local PDF directory scan completed successfully",
            data: result
        });
    } catch (error) {
        console.error("Error running PDF scan:", error);
        res.status(500).json({
            success: false,
            message: "Failed to scan PDFs directory",
            error: error.message
        });
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

// ==========================================
// 2. Download / Serve PDF File Securely
// ==========================================
router.get("/:id/download", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid PDF ID format" });
        }

        const pdf = await PDF.findById(id);
        if (!pdf) {
            return res.status(404).json({ success: false, message: "PDF not found" });
        }

        // Case A: Local folder PDF
        if (pdf.source === "local-folder" && pdf.localFilePath) {
            const rootDir = getPDFsRootDir();
            const resolvedPath = path.resolve(rootDir, pdf.localFilePath);

            // Path Traversal Security Verification:
            // The resolved path MUST be strictly located inside rootDir
            const relative = path.relative(rootDir, resolvedPath);
            if (relative.startsWith("..") || path.isAbsolute(relative)) {
                console.error(`[Security Alert] Path traversal attempt blocked: ${pdf.localFilePath}`);
                return res.status(403).json({
                    success: false,
                    message: "Access Denied: Path traversal detected"
                });
            }

            if (!fs.existsSync(resolvedPath)) {
                return res.status(404).json({
                    success: false,
                    message: "The requested PDF file is not found on the server storage"
                });
            }

            // Verify file extension
            if (path.extname(resolvedPath).toLowerCase() !== ".pdf") {
                return res.status(400).json({
                    success: false,
                    message: "The requested file is not a valid PDF"
                });
            }

            const stat = fs.statSync(resolvedPath);
            const downloadFilename = pdf.fileName || path.basename(resolvedPath);
            const isAttachment = req.query.download === "true" || req.query.attachment === "true";

            res.writeHead(200, {
                "Content-Type": "application/pdf",
                "Content-Length": stat.size,
                "Content-Disposition": `${isAttachment ? "attachment" : "inline"}; filename="${encodeURIComponent(downloadFilename)}"`,
                "Cache-Control": "public, max-age=86400"
            });

            const stream = fs.createReadStream(resolvedPath);
            stream.pipe(res);
            return;
        }

        // Case B: Cloudinary or Remote URL PDF
        if (pdf.pdfFileUrl && (pdf.pdfFileUrl.startsWith("http://") || pdf.pdfFileUrl.startsWith("https://"))) {
            return res.redirect(pdf.pdfFileUrl);
        }

        return res.status(404).json({
            success: false,
            message: "No valid download source found for this PDF"
        });
    } catch (error) {
        console.error("Error serving PDF file:", error);
        res.status(500).json({
            success: false,
            message: "Failed to stream PDF file",
            error: error.message
        });
    }
});

// ==========================================
// 3. Get PDFs with Filters & Search
// ==========================================
router.get("/", async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json({
                success: true,
                pdfs: [],
                totalPages: 1,
                currentPage: 1,
                totalItems: 0,
                message: "Database in offline/connecting mode"
            });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 50;
        const skip = (page - 1) * limit;

        const filter = {};

        // Availability check
        if (req.query.all !== "true") {
            filter.isAvailable = { $ne: false };
        }

        // Status filter
        if (req.query.status) {
            filter.status = req.query.status;
        } else {
            filter.status = "published";
        }

        // Branch filter (e.g. CSE, ECE, ISE)
        if (req.query.branch && req.query.branch !== "All" && req.query.branch !== "All Branches") {
            filter.branch = new RegExp(`^${req.query.branch}$`, "i");
        }

        // Semester filter (e.g. 5 or "Sem 5")
        if (req.query.semester && req.query.semester !== "All" && req.query.semester !== "All Semesters") {
            const semNum = parseInt(String(req.query.semester).replace(/\D/g, ""), 10);
            if (!isNaN(semNum)) {
                filter.semester = semNum;
            }
        }

        // Subject code filter (e.g. BCS501)
        if (req.query.subjectCode) {
            filter.subjectCode = new RegExp(req.query.subjectCode, "i");
        }

        // Module filter (e.g. "Module 3")
        if (req.query.module) {
            filter.module = new RegExp(req.query.module, "i");
        }

        // Source filter (e.g. "local-folder")
        if (req.query.source) {
            filter.source = req.query.source;
        }

        // Text search across title, subjectCode, subjectName, module, tags, author
        if (req.query.search) {
            const q = req.query.search.trim();
            const searchRegex = new RegExp(q, "i");
            filter.$or = [
                { title: searchRegex },
                { subjectCode: searchRegex },
                { subjectName: searchRegex },
                { module: searchRegex },
                { author: searchRegex },
                { fileName: searchRegex },
                { description: searchRegex },
                { tags: searchRegex }
            ];
        }

        // Category filter
        if (req.query.category && req.query.category !== "All") {
            filter.category = new RegExp(req.query.category, "i");
        }

        // Price range filter
        if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
            filter.price = {};
            if (req.query.minPrice !== undefined) filter.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice !== undefined) filter.price.$lte = parseFloat(req.query.maxPrice);
        }

        const sortBy = req.query.sortBy || "createdAt";
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

        const pdfs = await PDF.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage storeName")
            .populate("uploadedBy", "username profileImage");

        const totalPDFs = await PDF.countDocuments(filter);

        res.status(200).json({
            success: true,
            pdfs,
            totalPages: Math.ceil(totalPDFs / limit) || 1,
            currentPage: page,
            totalItems: totalPDFs
        });
    } catch (error) {
        console.error("Error getting PDF listings:", error.message);
        res.status(200).json({
            success: true,
            pdfs: [],
            totalPages: 1,
            currentPage: 1,
            totalItems: 0,
            error: error.message
        });
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

// ==========================================
// 4. Get Single PDF Metadata by ID
// ==========================================
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid PDF ID format" });
        }

        const pdf = await PDF.findById(req.params.id)
            .populate("user", "username profileImage storeName bio")
            .populate("uploadedBy", "username profileImage");

        if (!pdf) return res.status(404).json({ message: "PDF not found" });

        // Ensure safe response (localFilePath removed by schema transform)
        res.status(200).json({
            success: true,
            pdf: pdf.toJSON()
        });
    } catch (error) {
        console.error("Error getting PDF:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ==========================================
// 5. Create a PDF listing for sale (Seller Upload)
// ==========================================
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
            drmEnabled,
            branch,
            semester,
            subjectCode,
            subjectName,
            module,
            scheme,
            university,
            materialType
        } = req.body;

        if (!title || price === undefined || !pdfFileUrl) {
            return res.status(400).json({
                message: "Title, Price, and PDF file URL are required fields."
            });
        }

        const newPDF = new PDF({
            title,
            author: author || "Unknown",
            price: Number(price) || 0,
            description,
            coverImage,
            pdfFileUrl,
            category,
            tags,
            pageCount: pageCount || 1,
            language: language || "en",
            previewPages: previewPages || 0,
            drmEnabled: drmEnabled || false,
            branch: branch || "CSE",
            semester: Number(semester) || 1,
            subjectCode: subjectCode || "",
            subjectName: subjectName || "",
            module: module || "",
            scheme: scheme || "2022 Scheme",
            university: university || "VTU",
            materialType: materialType || "Module Notes",
            source: "manual-upload",
            user: req.user._id,
            uploadedBy: req.user._id,
            status: "published",
            salesCount: 0,
            rating: 4.8,
            reviewCount: 0
        });

        await newPDF.save();
        res.status(201).json(newPDF);
    } catch (error) {
        console.error("Error creating PDF listing:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ==========================================
// 6. Get PDFs listed by current user (Seller Dashboard)
// ==========================================
router.get("/user/mystore", protectRoute, async (req, res) => {
    try {
        const pdfs = await PDF.find({
            $or: [{ user: req.user._id }, { uploadedBy: req.user._id }]
        }).sort({ createdAt: -1 });
        res.status(200).json(pdfs);
    } catch (error) {
        console.error("Error getting seller PDF listings:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ==========================================
// 7. Update a PDF listing
// ==========================================
router.put("/:id", protectRoute, async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);
        if (!pdf) return res.status(404).json({ message: "PDF listing not found" });

        // Check ownership or admin
        const isOwner = pdf.user && pdf.user.toString() === req.user._id.toString();
        const isUploader = pdf.uploadedBy && pdf.uploadedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isUploader && !isAdmin) {
            return res.status(403).json({ message: "Unauthorized to modify this listing" });
        }

        const allowedFields = [
            "title", "author", "price", "description", "coverImage",
            "pdfFileUrl", "category", "tags", "pageCount", "language",
            "previewPages", "drmEnabled", "status", "branch", "semester",
            "subjectCode", "subjectName", "module", "scheme", "materialType"
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                pdf[field] = req.body[field];
            }
        }

        await pdf.save();
        res.status(200).json(pdf);
    } catch (error) {
        console.error("Error updating PDF listing:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ==========================================
// 8. Delete a PDF listing
// ==========================================
router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);
        if (!pdf) return res.status(404).json({ message: "PDF listing not found" });

        const isOwner = pdf.user && pdf.user.toString() === req.user._id.toString();
        const isUploader = pdf.uploadedBy && pdf.uploadedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isUploader && !isAdmin) {
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
