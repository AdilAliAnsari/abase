import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        default: "Unknown",
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    originalPrice: {
        type: Number,
    },
    coverImage: {
        type: String,
        default: "",
    },
    category: {
        type: String,
        default: "General",
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0,
    },
    totalQuantity: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

// Pre-save hook: recalculate totals
cartSchema.pre("save", function () {
    this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalAmount = Math.round(
        this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 100
    ) / 100;
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
export { Cart };
export default Cart;
