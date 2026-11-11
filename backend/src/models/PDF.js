import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "PDF title is required"],
        trim: true,
        index: true
    },
    subjectCode: {
        type: String,
        trim: true,
        index: true,
        default: ""
    },
    subjectName: {
        type: String,
        trim: true,
        default: ""
    },
    module: {
        type: String,
        trim: true,
        default: ""
    },
    branch: {
        type: String,
        trim: true,
        index: true,
        default: "CSE"
    },
    semester: {
        type: Number,
        index: true,
        default: 1
    },
    scheme: {
        type: String,
        trim: true,
        default: "2022 Scheme"
    },
    university: {
        type: String,
        trim: true,
        default: "VTU"
    },
    materialType: {
        type: String,
        trim: true,
        default: "PDF"
    },
    fileName: {
        type: String,
        trim: true,
        default: ""
    },
    localFilePath: {
        type: String,
        trim: true,
        sparse: true,
        index: true
    },
    pdfFileUrl: {
        type: String,
        trim: true,
        default: ""
    },
    fileSize: {
        type: String,
        trim: true,
        default: "0 KB"
    },
    fileSizeBytes: {
        type: Number,
        default: 0
    },
    author: {
        type: String,
        trim: true,
        default: "VTU Faculty"
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    source: {
        type: String,
        enum: ["local-folder", "cloudinary", "manual-upload"],
        default: "local-folder",
        index: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    isAvailable: {
        type: Boolean,
        default: true,
        index: true
    },
    notified: {
        type: Boolean,
        default: false,
        index: true
    },

    // Existing fields preserved for backward compatibility
    price: {
        type: Number,
        min: [0, "Price cannot be negative"],
        default: 0
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    coverImage: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        trim: true,
        default: ""
    },
    tags: {
        type: [String],
        default: []
    },
    pageCount: {
        type: Number,
        min: [1, "Page count must be at least 1"],
        default: 1
    },
    language: {
        type: String,
        trim: true,
        default: "en"
    },
    previewPages: {
        type: Number,
        min: [0, "Preview pages cannot be negative"],
        default: 0
    },
    drmEnabled: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["draft", "published", "archived"],
        default: "published"
    },
    salesCount: {
        type: Number,
        min: [0, "Sales count cannot be negative"],
        default: 0
    },
    rating: {
        type: Number,
        default: 4.8
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    user: { // The seller (optional for local scanned files)
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
}, { timestamps: true });

// Prevent leaking private filesystem paths to mobile/API clients
pdfSchema.set("toJSON", {
    transform: (doc, ret) => {
        // Fallback for pdfFileUrl if not set
        if (!ret.pdfFileUrl && ret._id) {
            ret.pdfFileUrl = `/api/pdfs/${ret._id}/download`;
        }
        delete ret.localFilePath;
        return ret;
    }
});

pdfSchema.set("toObject", {
    transform: (doc, ret) => {
        if (!ret.pdfFileUrl && ret._id) {
            ret.pdfFileUrl = `/api/pdfs/${ret._id}/download`;
        }
        delete ret.localFilePath;
        return ret;
    }
});

// Indexes for high performance querying & searching
pdfSchema.index({ branch: 1, semester: 1 });
pdfSchema.index({ subjectCode: 1, module: 1 });
pdfSchema.index({ title: "text", subjectCode: "text", subjectName: "text", description: "text", tags: "text" });

const PDF = mongoose.models.PDF || mongoose.model("PDF", pdfSchema);
export { PDF };
export default PDF;
