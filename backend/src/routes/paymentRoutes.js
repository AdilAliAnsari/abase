import express from "express";
import {
    createOrder,
    getPaymentStatus,
    verifyPayment,
    handleWebhook
} from "../controllers/paymentController.js";

const router = express.Router();

/**
 * @route   POST /api/payments/create-order
 * @desc    Create a new payment order with Razorpay and persist to database
 * @access  Public / Authenticated
 */
router.post("/create-order", createOrder);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment status and signature server-side with Razorpay
 * @access  Public / Authenticated
 */
router.post("/verify", verifyPayment);

/**
 * @route   POST /api/payments/webhook
 * @desc    Razorpay webhook listener for asynchronous event notifications
 * @access  Public (Signature Verified)
 */
router.post("/webhook", handleWebhook);

/**
 * @route   GET /api/payments/:orderId
 * @desc    Fetch payment and order status by orderId
 * @access  Public / Authenticated
 */
router.get("/:orderId", getPaymentStatus);

export default router;
