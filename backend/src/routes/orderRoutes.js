import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import { protectRoute } from "./auth.js";

const router = express.Router();

/**
 * POST /api/orders
 * Place a new order (Amazon Buy Now or Cart Checkout)
 */
router.post("/", async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            deliverySpeed = "FREE Prime Delivery",
            estimatedDelivery = "Tomorrow by 9 PM",
            paymentMethod = "Razorpay",
            paymentStatus = "PAID",
            paymentId = "",
            razorpayOrderId = "",
            itemsTotal,
            deliveryFee = 0,
            totalAmount,
            customerName,
            customerEmail,
            customerPhone
        } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Order must contain at least one item" });
        }

        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.flat || !shippingAddress.pincode) {
            return res.status(400).json({ success: false, message: "Valid shipping address is required" });
        }

        // Generate unique order ID in Amazon style (e.g. 408-1234567-8901234)
        const orderId = `OD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

        let userId = null;
        const authHeader = req.headers.authorization || req.headers["x-auth-token"];
        if (authHeader) {
            await new Promise((resolve) => {
                protectRoute(req, res, () => {
                    if (req.user) userId = req.user._id;
                    resolve();
                });
            });
        }

        const newOrder = new Order({
            orderId,
            user: userId,
            customerName: customerName || shippingAddress.fullName,
            customerEmail: customerEmail || "",
            customerPhone: customerPhone || shippingAddress.phone,
            items: items.map(item => ({
                bookId: item.id || item.bookId || "",
                title: item.title,
                author: item.author || "",
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1,
                coverImage: item.coverImage || ""
            })),
            shippingAddress: {
                fullName: shippingAddress.fullName,
                phone: shippingAddress.phone,
                pincode: shippingAddress.pincode,
                flat: shippingAddress.flat,
                area: shippingAddress.area,
                landmark: shippingAddress.landmark || "",
                city: shippingAddress.city,
                state: shippingAddress.state,
                addressType: shippingAddress.addressType || "Home",
                deliveryInstructions: shippingAddress.deliveryInstructions || ""
            },
            deliverySpeed,
            estimatedDelivery,
            paymentMethod,
            paymentStatus: paymentMethod === "COD" || paymentMethod === "Cash on Delivery" ? "COD" : (paymentStatus || "PAID"),
            paymentId,
            razorpayOrderId,
            itemsTotal: Number(itemsTotal) || Number(totalAmount) || 0,
            deliveryFee: Number(deliveryFee) || 0,
            totalAmount: Number(totalAmount) || Number(itemsTotal) || 0,
            orderStatus: "PLACED"
        });

        await newOrder.save();

        // Create persistent in-app notification if user is logged in
        if (userId) {
            try {
                await Notification.create({
                    user: userId,
                    title: `Order Placed: ${orderId}`,
                    message: `Your order for "${items[0]?.title}" has been placed successfully. Delivery to ${shippingAddress.city} by ${estimatedDelivery}.`,
                    type: "order",
                    metadata: {
                        pdfTitle: items[0]?.title
                    },
                    read: false
                });
            } catch (notifErr) {
                console.warn("Could not create order notification:", notifErr.message);
            }
        }

        console.log(`[Order Service] 📦 Order created successfully: ${orderId} (${paymentMethod}, ₹${newOrder.totalAmount})`);

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: newOrder
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to place order",
            error: error.message
        });
    }
});

/**
 * GET /api/orders
 * Fetch user's orders or all orders
 */
router.get("/", async (req, res) => {
    try {
        let filter = {};
        const authHeader = req.headers.authorization || req.headers["x-auth-token"];
        if (authHeader) {
            await new Promise((resolve) => {
                protectRoute(req, res, () => {
                    if (req.user && req.user.role !== "admin" && req.user.role !== "distributor") {
                        filter.user = req.user._id;
                    }
                    resolve();
                });
            });
        }

        const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(50);
        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/orders/:id
 * Fetch single order
 */
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findOne({
            $or: [{ orderId: req.params.id }, { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null }]
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
