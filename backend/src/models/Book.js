import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "PDF title is required"],
        trim: true
    },
    author: {
        type: String,
        trim: true,
        default: "Unknown"
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    description: {
        type: String,
        trim: true
    },
    coverImage: {
        type: String,
        default: ""
    },
    pdfFileUrl: {
        type: String,
        required: [true, "PDF file URL is required"],
        trim: true
    },
    category: {
        type: String,
        trim: true
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
        default: "draft"
    },
    salesCount: {
        type: Number,
        min: [0, "Sales count cannot be negative"],
        default: 0
    },
    user: { // The seller
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

// Index for text search across title, description, and tags
pdfSchema.index({ title: "text", description: "text", tags: "text" });

const PDF = mongoose.model("PDF", pdfSchema);
export { PDF };
export default PDF;