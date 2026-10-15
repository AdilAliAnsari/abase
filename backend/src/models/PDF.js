import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, trim: true, default: "Unknown" },
  price: { type: Number, required: true, min: 0, default: 0 },
  description: { type: String, trim: true, default: "" },
  coverImage: { type: String, default: "" },
  pdfFileUrl: { type: String, required: true, trim: true },
  category: { type: String, trim: true, default: "General" },
  tags: { type: [String], default: [] },
  pageCount: { type: Number, min: 1, default: 1 },
  language: { type: String, trim: true, default: "en" },
  previewPages: { type: Number, min: 0, default: 0 },
  drmEnabled: { type: Boolean, default: false },
  status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
  salesCount: { type: Number, min: 0, default: 0 },
  subjectCode: { type: String, trim: true, default: "" },
  scheme: { type: String, trim: true, default: "2022 Scheme" },
  branch: { type: String, trim: true, default: "CSE" },
  year: { type: String, trim: true, default: "3rd Year" },
  semester: { type: Number, min: 1, max: 8 },
  university: { type: String, trim: true, default: "VTU" },
  materialType: { type: String, trim: true, default: "Module Notes" },
  fileSize: { type: String, trim: true, default: "" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

pdfSchema.index({ title: "text", author: "text", description: "text", tags: "text", subjectCode: "text" });
pdfSchema.index({ status: 1, createdAt: -1 });

const PDF = mongoose.models.PDF || mongoose.model("PDF", pdfSchema);
export { PDF };
export default PDF;
