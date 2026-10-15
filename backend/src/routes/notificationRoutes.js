import express from "express";
import { protectRoute } from "./auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/", protectRoute, async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 30));
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id }).populate("pdf", "title author category").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Notification.countDocuments({ user: req.user._id, read: false }),
    ]);
    res.json({ success: true, notifications, unreadCount, page });
  } catch (error) {
    console.error("List notifications failed:", error);
    res.status(500).json({ success: false, message: "Could not load notifications." });
  }
});

router.patch("/read-all", protectRoute, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (error) {
    console.error("Mark notifications read failed:", error);
    res.status(500).json({ success: false, message: "Could not update notifications." });
  }
});

router.patch("/:id/read", protectRoute, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { read: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found." });
    res.json({ success: true, notification });
  } catch (error) {
    console.error("Mark notification read failed:", error);
    res.status(500).json({ success: false, message: "Could not update notification." });
  }
});

export default router;
