import express from "express";
import mongoose from "mongoose";
import { getAuth } from "@clerk/express";
import Cart from "../models/Cart.js";
import Book from "../models/Book.js";

const router = express.Router();

// In-memory fallback cart store for dev / offline mode
const inMemoryCarts = new Map();

// Helper to get userId from Clerk auth or fallback header / guest
const getUserId = (req) => {
    try {
        const { userId } = getAuth(req);
        if (userId) return userId;
    } catch {
        // Clerk may not be authenticated
    }
    return req.headers["x-user-id"] || "guest_user";
};

// Helper to calculate totals
const computeTotals = (items) => {
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalAmount = Math.round(
        items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) * 100
    ) / 100;
    return { totalQuantity, totalAmount };
};

// 1. GET /api/cart - Get user cart
router.get("/", async (req, res) => {
    try {
        const userId = getUserId(req);

        if (mongoose.connection.readyState === 1) {
            let cart = await Cart.findOne({ userId });
            if (!cart) {
                cart = new Cart({ userId, items: [] });
                await cart.save();
            }
            return res.status(200).json({
                success: true,
                cart: {
                    userId: cart.userId,
                    items: cart.items,
                    totalQuantity: cart.totalQuantity,
                    totalAmount: cart.totalAmount,
                }
            });
        }

        // In-memory fallback
        let items = inMemoryCarts.get(userId) || [];
        const { totalQuantity, totalAmount } = computeTotals(items);
        return res.status(200).json({
            success: true,
            cart: {
                userId,
                items,
                totalQuantity,
                totalAmount,
            }
        });
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ success: false, message: "Error fetching cart", error: error.message });
    }
});

// 2. POST /api/cart/add - Add book to cart
router.post("/add", async (req, res) => {
    try {
        const userId = getUserId(req);
        const { bookId, title, author, price, originalPrice, coverImage, category, quantity = 1 } = req.body;

        if (!bookId || !title || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "bookId, title, and price are required to add to cart"
            });
        }

        const qty = Math.max(1, parseInt(quantity) || 1);
        const numPrice = parseFloat(price);

        if (mongoose.connection.readyState === 1) {
            let cart = await Cart.findOne({ userId });
            if (!cart) {
                cart = new Cart({ userId, items: [] });
            }

            const existingIndex = cart.items.findIndex(item => item.bookId === String(bookId));
            if (existingIndex > -1) {
                cart.items[existingIndex].quantity += qty;
            } else {
                cart.items.push({
                    bookId: String(bookId),
                    title,
                    author: author || "Unknown",
                    price: numPrice,
                    originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
                    coverImage: coverImage || "",
                    category: category || "General",
                    quantity: qty,
                });
            }

            await cart.save();

            return res.status(200).json({
                success: true,
                message: "Item added to cart",
                cart: {
                    userId: cart.userId,
                    items: cart.items,
                    totalQuantity: cart.totalQuantity,
                    totalAmount: cart.totalAmount,
                }
            });
        }

        // In-memory fallback
        let items = inMemoryCarts.get(userId) || [];
        const existingIndex = items.findIndex(item => item.bookId === String(bookId));
        if (existingIndex > -1) {
            items[existingIndex].quantity += qty;
        } else {
            items.push({
                bookId: String(bookId),
                title,
                author: author || "Unknown",
                price: numPrice,
                originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
                coverImage: coverImage || "",
                category: category || "General",
                quantity: qty,
            });
        }
        inMemoryCarts.set(userId, items);
        const { totalQuantity, totalAmount } = computeTotals(items);

        res.status(200).json({
            success: true,
            message: "Item added to cart",
            cart: {
                userId,
                items,
                totalQuantity,
                totalAmount,
            }
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, message: "Error adding item to cart", error: error.message });
    }
});

// 3. PUT /api/cart/update - Update item quantity
router.put("/update", async (req, res) => {
    try {
        const userId = getUserId(req);
        const { bookId, quantity } = req.body;

        if (!bookId || quantity === undefined) {
            return res.status(400).json({ success: false, message: "bookId and quantity are required" });
        }

        const newQty = parseInt(quantity);

        if (mongoose.connection.readyState === 1) {
            let cart = await Cart.findOne({ userId });
            if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

            if (newQty <= 0) {
                cart.items = cart.items.filter(item => item.bookId !== String(bookId));
            } else {
                const item = cart.items.find(item => item.bookId === String(bookId));
                if (item) item.quantity = newQty;
            }

            await cart.save();

            return res.status(200).json({
                success: true,
                message: "Cart updated",
                cart: {
                    userId: cart.userId,
                    items: cart.items,
                    totalQuantity: cart.totalQuantity,
                    totalAmount: cart.totalAmount,
                }
            });
        }

        // In-memory fallback
        let items = inMemoryCarts.get(userId) || [];
        if (newQty <= 0) {
            items = items.filter(item => item.bookId !== String(bookId));
        } else {
            const item = items.find(item => item.bookId === String(bookId));
            if (item) item.quantity = newQty;
        }
        inMemoryCarts.set(userId, items);
        const { totalQuantity, totalAmount } = computeTotals(items);

        res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: {
                userId,
                items,
                totalQuantity,
                totalAmount,
            }
        });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ success: false, message: "Error updating cart", error: error.message });
    }
});

// 4. DELETE /api/cart/remove/:bookId - Remove item from cart
router.delete("/remove/:bookId", async (req, res) => {
    try {
        const userId = getUserId(req);
        const { bookId } = req.params;

        if (mongoose.connection.readyState === 1) {
            let cart = await Cart.findOne({ userId });
            if (cart) {
                cart.items = cart.items.filter(item => item.bookId !== String(bookId));
                await cart.save();
                return res.status(200).json({
                    success: true,
                    message: "Item removed from cart",
                    cart: {
                        userId: cart.userId,
                        items: cart.items,
                        totalQuantity: cart.totalQuantity,
                        totalAmount: cart.totalAmount,
                    }
                });
            }
        }

        // In-memory fallback
        let items = inMemoryCarts.get(userId) || [];
        items = items.filter(item => item.bookId !== String(bookId));
        inMemoryCarts.set(userId, items);
        const { totalQuantity, totalAmount } = computeTotals(items);

        res.status(200).json({
            success: true,
            message: "Item removed from cart",
            cart: {
                userId,
                items,
                totalQuantity,
                totalAmount,
            }
        });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ success: false, message: "Error removing item from cart", error: error.message });
    }
});

// 5. DELETE /api/cart/clear - Clear entire cart
router.delete("/clear", async (req, res) => {
    try {
        const userId = getUserId(req);

        if (mongoose.connection.readyState === 1) {
            let cart = await Cart.findOne({ userId });
            if (cart) {
                cart.items = [];
                await cart.save();
            }
        }

        inMemoryCarts.set(userId, []);

        res.status(200).json({
            success: true,
            message: "Cart cleared",
            cart: {
                userId,
                items: [],
                totalQuantity: 0,
                totalAmount: 0,
            }
        });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ success: false, message: "Error clearing cart", error: error.message });
    }
});

export default router;
