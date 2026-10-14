import crypto from "crypto";

/**
 * Verifies Razorpay payment signature after successful client checkout
 * Algorithm: HMAC-SHA256 of `${razorpay_order_id}|${razorpay_payment_id}` using key_secret
 * @param {Object} params
 * @param {string} params.razorpay_order_id
 * @param {string} params.razorpay_payment_id
 * @param {string} params.razorpay_signature
 * @param {string} params.key_secret
 * @returns {boolean} True if signature is authentic
 */
export const verifyPaymentSignature = ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    key_secret
}) => {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !key_secret) {
        return false;
    }

    try {
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(body)
            .digest("hex");

        const signatureBuffer = Buffer.from(razorpay_signature, "utf-8");
        const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

        if (signatureBuffer.length !== expectedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch (error) {
        console.error("Payment signature verification error:", error.message);
        return false;
    }
};

/**
 * Verifies Razorpay webhook signature
 * Algorithm: HMAC-SHA256 of raw request body using webhook_secret
 * @param {Object} params
 * @param {string} params.signature - Value from 'x-razorpay-signature' header
 * @param {string} params.rawBody - Exact raw request body
 * @param {string} params.webhookSecret - Razorpay webhook secret
 * @returns {boolean} True if webhook is authentic
 */
export const verifyWebhookSignature = ({ signature, rawBody, webhookSecret }) => {
    if (!signature || !rawBody || !webhookSecret) {
        return false;
    }

    try {
        const bodyStr = typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody);
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(bodyStr)
            .digest("hex");

        const signatureBuffer = Buffer.from(signature, "utf-8");
        const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

        if (signatureBuffer.length !== expectedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch (error) {
        console.error("Webhook signature verification error:", error.message);
        return false;
    }
};

/**
 * Maps Razorpay status strings to internal enum values
 * @param {string} razorpayStatus
 * @returns {string} One of ["CREATED", "PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"]
 */
export const mapRazorpayStatusToInternal = (razorpayStatus) => {
    if (!razorpayStatus) return "PENDING";
    const statusUpper = String(razorpayStatus).toUpperCase();

    switch (statusUpper) {
        case "CAPTURED":
        case "PAID":
        case "AUTHORIZED":
            return "SUCCESS";
        case "CREATED":
        case "ATTEMPTED":
            return "PENDING";
        case "FAILED":
            return "FAILED";
        case "REFUNDED":
            return "REFUNDED";
        case "CANCELLED":
            return "CANCELLED";
        default:
            return "PENDING";
    }
};

/**
 * Extracts normalized payment method from Razorpay payment entity
 * @param {Object} paymentEntity
 * @returns {string} Method name (e.g., 'upi', 'card', 'netbanking', 'wallet', 'emi')
 */
export const extractPaymentMethod = (paymentEntity) => {
    if (!paymentEntity) return "unknown";
    if (paymentEntity.method) {
        return String(paymentEntity.method).toLowerCase();
    }
    return "unknown";
};

/**
 * Sanitizes payment response before saving to database or returning via API
 * Ensures sensitive data is never persisted or leaked
 * @param {Object} data
 * @returns {Object} Sanitized data
 */
export const sanitizePaymentData = (data) => {
    if (!data || typeof data !== "object") return data;

    const sanitized = JSON.parse(JSON.stringify(data));

    const sensitiveKeys = [
        "secret",
        "key_secret",
        "secretKey",
        "password",
        "otp",
        "cvv",
        "card_cvv",
        "upi_pin",
        "pin",
        "token"
    ];

    const cleanObject = (obj) => {
        if (!obj || typeof obj !== "object") return;
        for (const key of Object.keys(obj)) {
            if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
                delete obj[key];
            } else if (typeof obj[key] === "object") {
                cleanObject(obj[key]);
            }
        }
    };

    cleanObject(sanitized);
    return sanitized;
};
