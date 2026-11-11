import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Book title is required"],
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
        min: [0, "Price cannot be negative"],
        max: [1000, "Book price cannot be more than ₹1000"]
    },
    originalPrice: {
        type: Number,
        min: [0, "Original price cannot be negative"],
        max: [1000, "Original price cannot be more than ₹1000"]
    },
    currency: {
        type: String,
        default: "INR"
    },
    isPrime: {
        type: Boolean,
        default: true
    },
    deliveryTag: {
        type: String,
        default: "FREE delivery Tomorrow"
    },
    stockCount: {
        type: Number,
        default: 50
    },
    inStock: {
        type: Boolean,
        default: true
    },
    distributorId: {
        type: String,
        default: ""
    },
    rating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5
    },
    reviews: {
        type: Number,
        default: 0
    },
    coverImage: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        trim: true,
        default: "General"
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    pages: {
        type: Number,
        default: 100
    },
    publisher: {
        type: String,
        default: "Independent"
    },
    language: {
        type: String,
        default: "English"
    },
    badge: {
        type: String,
        enum: ["BESTSELLER", "NEW", "HOT", ""],
        default: ""
    },
    accent: {
        type: String,
        enum: ["orange", "blue", "purple", "teal"],
        default: "blue"
    },
    pdfFileUrl: {
        type: String,
        default: ""
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

// Text index for search
bookSchema.index({ title: "text", author: "text", category: "text", description: "text" });

const Book = mongoose.models.Book || mongoose.model("Book", bookSchema);
export { Book };
export default Book;