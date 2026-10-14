import { Payment } from "../models/Payment.js";
import razorpayService from "../services/razorpayService.js";
import { getAuth } from "@clerk/express";

/**
 * Validates email format
 */
const isValidEmail = (email) => {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Validates phone format
 */
const isValidPhone = (phone) => {
    return typeof phone === "string" && /^\+?[0-9]{10,14}$/.test(phone.trim().replace(/[\s-]/g, ""));
};

/**
 * Helper to get authenticated Clerk user ID if available
 */
const getUserIdFromReq = (req) => {
    try {
        const auth = getAuth(req);
        if (auth && auth.userId) {
            return auth.userId;
        }
    } catch {
        // Clerk middleware may not have authenticated request
    }
    return req.user?.clerkId || req.user?._id?.toString() || null;
};

/**
 * Controller: Create Payment Order
 * POST /api/payments/create-order
 */
export const createOrder = async (req, res) => {
    try {
        const { amount, currency = "INR", receipt, notes = {}, customer } = req.body;

        // 1. Amount Validation
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                error: "Amount must be a positive number greater than 0"
            });
        }

        // 2. Currency Validation
        if (String(currency).toUpperCase() !== "INR") {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                error: "Currency must be 'INR'"
            });
        }

        // 3. Customer validation (optional, but validated if provided)
        let formattedCustomer = {};
        if (customer && typeof customer === "object") {
            if (customer.email && !isValidEmail(customer.email)) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    error: "Please provide a valid customer email address"
                });
            }
            if (customer.phone && !isValidPhone(customer.phone)) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    error: "Please provide a valid customer phone number (10-14 digits)"
                });
            }
            formattedCustomer = {
                id: customer.id ? String(customer.id).trim() : "",
                name: customer.name ? String(customer.name).trim() : "",
                email: customer.email ? String(customer.email).trim() : "",
                phone: customer.phone ? String(customer.phone).trim().replace(/[\s-]/g, "") : ""
            };
        }

        // 4. Create Razorpay order server-side
        const razorpayOrder = await razorpayService.createPaymentOrder({
            amount: parsedAmount,
            currency: "INR",
            receipt,
            notes
        });

        // 5. Associate authenticated user if available
        const authenticatedUserId = getUserIdFromReq(req) || formattedCustomer.id || null;

        // 6. Save order record to MongoDB
        const newPayment = new Payment({
            userId: authenticatedUserId,
            orderId: razorpayOrder.id,
            razorpayOrderId: razorpayOrder.id,
            amount: parsedAmount,
            amountPaise: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            receipt: razorpayOrder.receipt,
            status: "CREATED",
            customer: formattedCustomer,
            notes: razorpayOrder.notes || {},
            paymentResponse: razorpayOrder
        });

        await newPayment.save();

        // 7. Return safe non-sensitive response
        return res.status(201).json({
            success: true,
            message: "Payment order created successfully",
            data: {
                orderId: razorpayOrder.id,
                razorpayOrderId: razorpayOrder.id,
                keyId: process.env.RAZORPAY_KEY_ID || null,
                amount: parsedAmount,
                amountPaise: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                receipt: razorpayOrder.receipt,
                status: "CREATED",
                customer: formattedCustomer
            }
        });
    } catch (error) {
        console.error("Create order error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to create payment order",
            error: error.message
        });
    }
};

/**
 * Controller: Verify Payment
 * POST /api/payments/verify
 */
export const verifyPayment = async (req, res) => {
    try {
        const razorpay_order_id = req.body.razorpay_order_id || req.body.orderId;
        const razorpay_payment_id = req.body.razorpay_payment_id || req.body.paymentId;
        const razorpay_signature = req.body.razorpay_signature || req.body.signature;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                error: "Missing required verification fields: razorpay_order_id, razorpay_payment_id, razorpay_signature"
            });
        }

        // Find existing payment in MongoDB
        let paymentRecord = await Payment.findOne({
            $or: [
                { orderId: razorpay_order_id },
                { razorpayOrderId: razorpay_order_id }
            ]
        });

        // Idempotency check: If payment was already verified successfully
        if (paymentRecord && paymentRecord.status === "SUCCESS") {
            return res.status(200).json({
                success: true,
                message: "Payment already verified successfully",
                data: {
                    isVerified: true,
                    orderId: paymentRecord.orderId,
                    razorpayOrderId: paymentRecord.razorpayOrderId,
                    razorpayPaymentId: paymentRecord.razorpayPaymentId || razorpay_payment_id,
                    amount: paymentRecord.amount,
                    currency: paymentRecord.currency,
                    status: "SUCCESS",
                    paymentMethod: paymentRecord.paymentMethod
                }
            });
        }

        // Perform server-side signature and status verification
        const verification = await razorpayService.verifyPayment({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        });

        if (!verification.isVerified) {
            if (paymentRecord) {
                paymentRecord.status = "FAILED";
                paymentRecord.razorpayPaymentId = razorpay_payment_id;
                paymentRecord.razorpaySignature = razorpay_signature;
                await paymentRecord.save();
            }

            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
                error: "Invalid payment signature"
            });
        }

        // Update MongoDB record upon successful verification
        if (paymentRecord) {
            paymentRecord.status = verification.status;
            paymentRecord.razorpayPaymentId = razorpay_payment_id;
            paymentRecord.razorpaySignature = razorpay_signature;
            if (verification.paymentMethod) {
                paymentRecord.paymentMethod = verification.paymentMethod;
            }
            if (verification.paymentDetails) {
                paymentRecord.paymentResponse = verification.paymentDetails;
            }
            await paymentRecord.save();
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: {
                isVerified: true,
                orderId: paymentRecord ? paymentRecord.orderId : razorpay_order_id,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                amount: paymentRecord ? paymentRecord.amount : undefined,
                currency: paymentRecord ? paymentRecord.currency : "INR",
                status: verification.status,
                paymentMethod: verification.paymentMethod
            }
        });
    } catch (error) {
        console.error("Verify payment error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to verify payment",
            error: error.message
        });
    }
};

/**
 * Controller: Get Payment Status
 * GET /api/payments/:orderId
 */
export const getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId || !orderId.trim()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                error: "orderId parameter is required"
            });
        }

        const trimmedOrderId = orderId.trim();

        // 1. Look up in MongoDB
        let paymentRecord = await Payment.findOne({
            $or: [
                { orderId: trimmedOrderId },
                { razorpayOrderId: trimmedOrderId }
            ]
        });

        // 2. Fetch live status from Razorpay API
        const liveStatus = await razorpayService.getPaymentStatus(trimmedOrderId);

        // 3. Sync MongoDB record if present
        if (paymentRecord) {
            paymentRecord.status = liveStatus.status;
            if (liveStatus.razorpayPaymentId) {
                paymentRecord.razorpayPaymentId = liveStatus.razorpayPaymentId;
            }
            if (liveStatus.paymentMethod) {
                paymentRecord.paymentMethod = liveStatus.paymentMethod;
            }
            paymentRecord.paymentResponse = liveStatus.rawOrderData;
            await paymentRecord.save();
        }

        return res.status(200).json({
            success: true,
            message: "Payment status retrieved successfully",
            data: {
                orderId: liveStatus.orderId,
                razorpayOrderId: liveStatus.razorpayOrderId,
                razorpayPaymentId: liveStatus.razorpayPaymentId,
                amount: liveStatus.amount,
                amountPaise: liveStatus.amountPaise,
                currency: liveStatus.currency,
                status: liveStatus.status,
                paymentMethod: liveStatus.paymentMethod,
                customer: paymentRecord ? paymentRecord.customer : undefined
            }
        });
    } catch (error) {
        console.error("Get payment status error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve payment status",
            error: error.message
        });
    }
};

/**
 * Controller: Razorpay Webhook Handler
 * POST /api/payments/webhook
 */
export const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];

        if (!signature) {
            return res.status(400).json({
                success: false,
                message: "Missing 'x-razorpay-signature' header"
            });
        }

        const rawBody = req.rawBody || JSON.stringify(req.body);

        // Verify and parse webhook
        const event = razorpayService.handleWebhook({
            signature,
            rawBody,
            body: req.body
        });

        const { event: eventName, eventTime, razorpayOrderId, razorpayPaymentId, status, paymentMethod, amount, amountPaise, currency, rawPayload } = event;

        if (!razorpayOrderId) {
            return res.status(200).json({
                success: true,
                message: "Webhook acknowledged (no order ID attached)"
            });
        }

        // Look up payment in MongoDB
        let paymentRecord = await Payment.findOne({
            $or: [
                { orderId: razorpayOrderId },
                { razorpayOrderId: razorpayOrderId }
            ]
        });

        if (paymentRecord) {
            // Idempotency: append event to audit log
            paymentRecord.webhookEvents.push({
                event: eventName,
                eventTime,
                payload: rawPayload
            });

            // Prevent status degradation if already SUCCESS
            if (paymentRecord.status === "SUCCESS" && status !== "SUCCESS" && status !== "REFUNDED") {
                console.log(`Webhook received for already SUCCESS order ${razorpayOrderId}. Skipping downgrade to ${status}.`);
            } else {
                paymentRecord.status = status;
                if (razorpayPaymentId) {
                    paymentRecord.razorpayPaymentId = razorpayPaymentId;
                }
                if (paymentMethod && paymentMethod !== "unknown") {
                    paymentRecord.paymentMethod = paymentMethod;
                }
                paymentRecord.paymentResponse = rawPayload;
            }

            await paymentRecord.save();
        } else {
            // New order record created directly from webhook
            const newPayment = new Payment({
                orderId: razorpayOrderId,
                razorpayOrderId: razorpayOrderId,
                razorpayPaymentId: razorpayPaymentId || null,
                amount: amount || 0,
                amountPaise: amountPaise || 0,
                currency: currency || "INR",
                paymentMethod: paymentMethod !== "unknown" ? paymentMethod : null,
                status: status,
                paymentResponse: rawPayload,
                webhookEvents: [{
                    event: eventName,
                    eventTime,
                    payload: rawPayload
                }]
            });
            await newPayment.save();
        }

        return res.status(200).json({
            success: true,
            message: "Webhook processed successfully"
        });
    } catch (error) {
        console.error("Webhook processing error:", error.message);
        return res.status(400).json({
            success: false,
            message: "Webhook processing failed",
            error: error.message
        });
    }
};

export default {
    createOrder,
    verifyPayment,
    getPaymentStatus,
    handleWebhook
};
