import express from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { protectRoute } from "./auth.js";

const router = express.Router();

/**
 * GET /api/notifications
 * Fetch notifications for user (or all recent notifications)
 */
router.get("/", async (req, res) => {
    try {
        const authHeader = req.headers.authorization || req.headers["x-auth-token"];
        let userFilter = {};

        if (authHeader) {
            // Attempt to resolve user if auth header is present
            await new Promise((resolve) => {
                protectRoute(req, res, () => {
                    if (req.user) {
                        userFilter = { $or: [{ user: req.user._id }, { user: null }] };
                    }
                    resolve();
                });
            });
        }

        const limit = parseInt(req.query.limit, 10) || 50;
        const notifications = await Notification.find(userFilter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("pdfId", "title branch semester subjectCode fileSize");

        const unreadCount = await Notification.countDocuments({
            ...userFilter,
            read: false
        });

        res.status(200).json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
            error: error.message
        });
    }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put("/:id/read", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid notification ID" });
        }

        const notif = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notif) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, notification: notif });
    } catch (error) {
        console.error("Error marking notification read:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put("/read-all", async (req, res) => {
    try {
        let filter = {};
        const authHeader = req.headers.authorization || req.headers["x-auth-token"];
        if (authHeader) {
            await new Promise((resolve) => {
                protectRoute(req, res, () => {
                    if (req.user) {
                        filter = { user: req.user._id };
                    }
                    resolve();
                });
            });
        }

        await Notification.updateMany(filter, { read: true });
        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all read:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        await Notification.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
