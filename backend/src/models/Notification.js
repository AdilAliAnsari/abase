import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, "Notification title is required"],
        trim: true
    },
    message: {
        type: String,
        required: [true, "Notification message is required"],
        trim: true
    },
    type: {
        type: String,
        enum: ["pdf_added", "pdf", "order", "alert", "system", "promo"],
        default: "pdf_added",
        index: true
    },
    pdfId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PDF",
        default: null,
        index: true
    },
    metadata: {
        branch: { type: String, default: "" },
        semester: { type: Number, default: 0 },
        subjectCode: { type: String, default: "" },
        pdfTitle: { type: String, default: "" }
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ pdfId: 1, user: 1 });

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export { Notification };
export default Notification;
