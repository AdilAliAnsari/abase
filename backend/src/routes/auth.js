import { getAuth, clerkClient } from "@clerk/express";
import mongoose from "mongoose";
import { User } from "../models/User.js";

// Helper to extract clerk userId from getAuth or Bearer token claims
const resolveClerkUserId = (req) => {
    try {
        const { userId } = getAuth(req);
        if (userId) return userId;
    } catch {}

    const authHeader = req.headers.authorization || req.headers["x-auth-token"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();

    if (token && token.includes(".")) {
        try {
            const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf-8"));
            return payload.sub || payload.user_id || null;
        } catch {}
    }
    return null;
};

// Check if user is authenticated
export const requireAuth = (req, res, next) => {
    const userId = resolveClerkUserId(req);

    if (!userId) {
        return res.status(401).json({ 
            success: false,
            error: "Unauthorized - Please sign in via Clerk"
        });
    }

    next();
};

// Check if user is admin
export const requireAdmin = async (req, res, next) => {
    try {
        const userId = resolveClerkUserId(req);

        if (!userId) {
            return res.status(401).json({ 
                success: false,
                error: "Unauthorized" 
            });
        }

        const user = await User.findOne({ clerkId: userId });

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                error: "Forbidden - Admin access required" 
            });
        }

        next();
    } catch (error) {
        console.error("Admin check error:", error);
        res.status(500).json({ 
            success: false,
            error: "Internal server error" 
        });
    }
};

// Check if user is authenticated and attach MongoDB User object to req.user
export const protectRoute = async (req, res, next) => {
    try {
        const userId = resolveClerkUserId(req);

        // Fallback for native token format token_<mongoId>_<timestamp>
        if (!userId) {
            const authHeader = req.headers.authorization || req.headers["x-auth-token"] || "";
            const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();
            if (token && token.startsWith("token_")) {
                const mongoId = token.split("_")[1];
                if (mongoose.Types.ObjectId.isValid(mongoId)) {
                    const localUser = await User.findById(mongoId);
                    if (localUser) {
                        req.user = localUser;
                        return next();
                    }
                }
            }

            return res.status(401).json({ 
                success: false,
                message: "Unauthorized - Please sign in via Clerk"
            });
        }

        let user = await User.findOne({ clerkId: userId });

        // Auto-sync user from Clerk if authenticated but not yet recorded in MongoDB
        if (!user) {
            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                if (clerkUser) {
                    const email = clerkUser.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.user`;
                    const username = clerkUser.username || email.split("@")[0];
                    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || username;
                    const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || "";

                    user = await User.findOneAndUpdate(
                        { $or: [{ clerkId: userId }, { email }] },
                        {
                            clerkId: userId,
                            email,
                            username,
                            firstName: name,
                            phoneNumber: phone,
                            profileImage: clerkUser.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
                            provider: "clerk",
                            isEmailVerified: true,
                            lastLoginAt: new Date()
                        },
                        { upsert: true, new: true }
                    );
                }
            } catch (syncErr) {
                console.warn("Clerk auto-sync in protectRoute error:", syncErr.message);
            }
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User profile not found in database"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("protectRoute error:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};