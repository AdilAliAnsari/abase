import Razorpay from "razorpay";
import {
    verifyPaymentSignature as verifySignatureUtil,
    verifyWebhookSignature as verifyWebhookUtil,
    mapRazorpayStatusToInternal,
    extractPaymentMethod,
    sanitizePaymentData
} from "../utils/paymentVerification.js";

/**
 * Initializes and returns a Razorpay SDK instance
 */
const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        throw new Error("Razorpay credentials missing: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables.");
    }

    return new Razorpay({
        key_id,
        key_secret
    });
};

/**
 * Formats Razorpay API errors safely without exposing credentials
 */
const formatRazorpayError = (error) => {
    if (error.error && error.error.description) {
        return {
            message: error.error.description,
            code: error.error.code || "RAZORPAY_API_ERROR",
            source: error.error.source || "business"
        };
    }
    return {
        message: error.message || "An unexpected error occurred while communicating with Razorpay",
        code: "INTERNAL_RAZORPAY_ERROR",
        source: "internal"
    };
};

/**
 * Creates a Razorpay order
 * @param {Object} params
 * @param {number} params.amount - Amount in standard currency unit (e.g. 500 for 500 INR)
 * @param {string} [params.currency="INR"] - Currency code
 * @param {string} [params.receipt] - Custom merchant receipt ID
 * @param {Object} [params.notes={}] - Key-value metadata notes
 * @returns {Promise<Object>} Created Razorpay order
 */
export const createPaymentOrder = async ({
    amount,
    currency = "INR",
    receipt,
    notes = {}
}) => {
    try {
        const razorpay = getRazorpayInstance();

        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            throw new Error("Amount must be a positive number greater than 0.");
        }

        // Razorpay expects amount in paise (1 INR = 100 paise)
        const amountInPaise = Math.round(parsedAmount * 100);

        const options = {
            amount: amountInPaise,
            currency: String(currency || "INR").toUpperCase(),
            receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            notes: notes || {}
        };

        const order = await razorpay.orders.create(options);
        return sanitizePaymentData(order);
    } catch (error) {
        const formatted = formatRazorpayError(error);
        throw new Error(`Failed to create Razorpay order: ${formatted.message}`);
    }
};

/**
 * Fetches order details directly from Razorpay
 * @param {string} orderId - Razorpay Order ID (e.g., 'order_xxx')
 * @returns {Promise<Object>}
 */
export const getPaymentOrder = async (orderId) => {
    try {
        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.fetch(String(orderId));
        return sanitizePaymentData(order);
    } catch (error) {
        const formatted = formatRazorpayError(error);
        throw new Error(`Failed to fetch Razorpay order: ${formatted.message}`);
    }
};

/**
 * Fetches payment details by payment ID from Razorpay
 * @param {string} paymentId - Razorpay Payment ID (e.g., 'pay_xxx')
 * @returns {Promise<Object>}
 */
export const getPaymentDetails = async (paymentId) => {
    try {
        const razorpay = getRazorpayInstance();
        const payment = await razorpay.payments.fetch(String(paymentId));
        return sanitizePaymentData(payment);
    } catch (error) {
        const formatted = formatRazorpayError(error);
        throw new Error(`Failed to fetch payment details: ${formatted.message}`);
    }
};

/**
 * Fetches all payment attempts for a given order ID from Razorpay
 * @param {string} orderId - Razorpay Order ID
 * @returns {Promise<Array>}
 */
export const getOrderPayments = async (orderId) => {
    try {
        const razorpay = getRazorpayInstance();
        const response = await razorpay.orders.fetchPayments(String(orderId));
        return sanitizePaymentData(response.items || []);
    } catch (error) {
        const formatted = formatRazorpayError(error);
        throw new Error(`Failed to fetch order payments: ${formatted.message}`);
    }
};

/**
 * Retrieves normalized payment and order status
 * @param {string} orderId - Razorpay Order ID
 * @returns {Promise<Object>}
 */
export const getPaymentStatus = async (orderId) => {
    try {
        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.fetch(String(orderId));

        let payments = [];
        try {
            const paymentsResponse = await razorpay.orders.fetchPayments(String(orderId));
            payments = paymentsResponse.items || [];
        } catch {
            payments = [];
        }

        // Find successful payment (captured or authorized) or latest attempt
        const successfulPayment = payments.find(p => 
            String(p.status).toLowerCase() === "captured" || 
            String(p.status).toLowerCase() === "authorized"
        );
        const latestPayment = payments.length > 0 ? payments[payments.length - 1] : null;
        const activePayment = successfulPayment || latestPayment;

        const internalStatus = successfulPayment
            ? "SUCCESS"
            : mapRazorpayStatusToInternal(order.status);

        const paymentMethod = activePayment ? extractPaymentMethod(activePayment) : null;

        return {
            orderId: order.id,
            razorpayOrderId: order.id,
            razorpayPaymentId: activePayment ? activePayment.id : null,
            amount: order.amount / 100, // convert paise back to INR
            amountPaise: order.amount,
            currency: order.currency,
            status: internalStatus,
            razorpayOrderStatus: order.status,
            paymentMethod,
            receipt: order.receipt,
            payments: payments.map(sanitizePaymentData),
            rawOrderData: sanitizePaymentData(order)
        };
    } catch (error) {
        const formatted = formatRazorpayError(error);
        throw new Error(`Failed to get payment status: ${formatted.message}`);
    }
};

/**
 * Server-side payment signature verification
 * @param {Object} params
 * @param {string} params.razorpay_order_id
 * @param {string} params.razorpay_payment_id
 * @param {string} params.razorpay_signature
 * @returns {Promise<Object>}
 */
export const verifyPayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
}) => {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
        throw new Error("RAZORPAY_KEY_SECRET is not configured for signature verification.");
    }

    // 1. Verify HMAC SHA-256 signature
    const isValidSignature = verifySignatureUtil({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        key_secret
    });

    if (!isValidSignature) {
        return {
            isVerified: false,
            status: "FAILED",
            message: "Invalid payment signature verification failed",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        };
    }

    // 2. Fetch payment details from Razorpay to verify server-side status
    let paymentDetails = null;
    let paymentMethod = null;
    let status = "SUCCESS";

    try {
        paymentDetails = await getPaymentDetails(razorpay_payment_id);
        paymentMethod = extractPaymentMethod(paymentDetails);
        status = mapRazorpayStatusToInternal(paymentDetails.status);
    } catch (fetchErr) {
        console.warn("Could not fetch payment details after signature match:", fetchErr.message);
    }

    return {
        isVerified: true,
        status: status,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paymentMethod,
        paymentDetails: sanitizePaymentData(paymentDetails)
    };
};

/**
 * Verifies and parses incoming Razorpay webhook event
 * @param {Object} params
 * @param {string} params.signature - Value from 'x-razorpay-signature' header
 * @param {string} params.rawBody - Raw request body string
 * @param {Object} params.body - Parsed JSON body
 * @returns {Object} Verified and structured event data
 */
export const handleWebhook = ({ signature, rawBody, body }) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!webhookSecret) {
        throw new Error("Razorpay webhook secret is not configured in environment variables.");
    }

    // Verify webhook signature
    const isValid = verifyWebhookUtil({
        signature,
        rawBody,
        webhookSecret
    });

    if (!isValid) {
        throw new Error("Invalid webhook signature. Authenticity verification failed.");
    }

    const payload = body || (typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody);

    const event = payload.event || "unknown";
    const paymentEntity = payload.payload?.payment?.entity || {};
    const orderEntity = payload.payload?.order?.entity || {};

    const razorpayOrderId = paymentEntity.order_id || orderEntity.id;
    const razorpayPaymentId = paymentEntity.id;
    const paymentStatus = paymentEntity.status || orderEntity.status;
    const paymentMethod = extractPaymentMethod(paymentEntity);
    const mappedStatus = mapRazorpayStatusToInternal(paymentStatus);

    return {
        event,
        eventTime: payload.created_at ? new Date(payload.created_at * 1000) : new Date(),
        razorpayOrderId,
        razorpayPaymentId,
        amount: (paymentEntity.amount || orderEntity.amount) ? (paymentEntity.amount || orderEntity.amount) / 100 : 0,
        amountPaise: paymentEntity.amount || orderEntity.amount || 0,
        currency: paymentEntity.currency || orderEntity.currency || "INR",
        status: mappedStatus,
        paymentMethod,
        rawPayload: sanitizePaymentData(payload)
    };
};

export default {
    createPaymentOrder,
    getPaymentOrder,
    getPaymentDetails,
    getOrderPayments,
    getPaymentStatus,
    verifyPayment,
    handleWebhook
};
