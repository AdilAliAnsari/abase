import mongoose from "mongoose";

const amazonAddressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    pincode: { type: String, required: true },
    flat: { type: String, required: true },
    area: { type: String, required: true },
    landmark: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    addressType: { type: String, enum: ["Home", "Office"], default: "Home" },
    deliveryInstructions: { type: String, default: "" },
    isDefault: { type: Boolean, default: false }
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", default: null },
    bookId: { type: String, default: "" },
    title: { type: String, required: true },
    author: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    coverImage: { type: String, default: "" }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        default: null, 
        index: true 
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    items: [orderItemSchema],
    shippingAddress: amazonAddressSchema,
    deliverySpeed: {
        type: String,
        default: "FREE Prime Delivery"
    },
    estimatedDelivery: { 
        type: String, 
        default: "Tomorrow by 9 PM" 
    },
    paymentMethod: {
        type: String,
        enum: ["Razorpay", "UPI", "Cards", "NetBanking", "COD", "Cash on Delivery"],
        default: "Razorpay"
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED", "COD"],
        default: "PENDING"
    },
    paymentId: { type: String, default: "" },
    razorpayOrderId: { type: String, default: "" },
    itemsTotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    orderStatus: {
        type: String,
        enum: ["PLACED", "CONFIRMED", "DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
        default: "PLACED",
        index: true
    }
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export { Order };
export default Order;
