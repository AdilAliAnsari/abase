import { getAuth } from "@clerk/express";
import { User } from "../models/User.js";

// Check if user is authenticated
export const requireAuth = (req, res, next) => {
    const { isAuthenticated } = getAuth(req);

    if (!isAuthenticated) {
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
        const { isAuthenticated, userId } = getAuth(req);

        if (!isAuthenticated) {
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
        const { isAuthenticated, userId } = getAuth(req);

        if (!isAuthenticated || !userId) {
            return res.status(401).json({ 
                success: false,
                message: "Unauthorized - Please sign in via Clerk"
            });
        }

        const user = await User.findOne({ clerkId: userId });

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