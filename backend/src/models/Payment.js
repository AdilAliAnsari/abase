import mongoose from "mongoose";

const customerDetailsSchema = new mongoose.Schema({
    id: { type: String, default: "" },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" }
}, { _id: false });

const webhookEventSchema = new mongoose.Schema({
    event: { type: String, required: true },
    eventTime: { type: Date, default: Date.now },
    payload: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        index: true,
        default: null 
    },
    orderId: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true 
    },
    razorpayOrderId: { 
        type: String, 
        required: true,
        unique: true,
        index: true 
    },
    razorpayPaymentId: { 
        type: String, 
        default: null,
        index: true 
    },
    razorpaySignature: { 
        type: String, 
        default: null 
    },
    amount: { 
        type: Number, 
        required: true, 
        min: [1, "Amount must be at least 1"] 
    },
    amountPaise: { 
        type: Number, 
        required: true 
    },
    currency: { 
        type: String, 
        required: true, 
        default: "INR",
        uppercase: true 
    },
    receipt: { 
        type: String, 
        default: null 
    },
    paymentMethod: { 
        type: String, 
        default: null 
    },
    status: { 
        type: String, 
        enum: ["CREATED", "PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"], 
        default: "CREATED",
        index: true 
    },
    customer: { 
        type: customerDetailsSchema, 
        default: () => ({}) 
    },
    notes: { 
        type: mongoose.Schema.Types.Mixed, 
        default: {} 
    },
    paymentResponse: { 
        type: mongoose.Schema.Types.Mixed, 
        default: null 
    },
    webhookEvents: [webhookEventSchema]
}, { 
    timestamps: true 
});

const Payment = mongoose.model("Payment", paymentSchema);
export { Payment };
