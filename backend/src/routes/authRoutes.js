import express from "express";
import { clerkMiddleware, getAuth, clerkClient } from "@clerk/express";
import { User } from "../models/User.js";
import { generateOTP, sendVerificationEmail, sendPasswordResetEmail } from "../utils/emailServices.js";

const router = express.Router();
router.use(clerkMiddleware());

// Validation helper
const validateInput = (email, username, password) => {
    const errors = [];

    // Email validation
    if (!email) {
        errors.push("Email is required");
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
        errors.push("Please enter a valid email address");
    }

    // Username validation (8+ characters)
    if (!username) {
        errors.push("Username is required");
    } else if (username.length < 8) {
        errors.push("Username must be at least 8 characters");
    } else if (username.length > 30) {
        errors.push("Username cannot exceed 30 characters");
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push("Username can only contain letters, numbers, and underscores");
    }

    // Password validation (8+ characters, strong)
    if (!password) {
        errors.push("Password is required");
    } else if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
    } else if (password.length > 128) {
        errors.push("Password cannot exceed 128 characters");
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
        errors.push("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)");
    }

    return errors;
};

// ─── POST /api/auth/register ───
// Register with validation + email verification
router.post("/register", async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Validate all inputs
        const validationErrors = validateInput(email, username, password);
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: "Validation failed",
                errors: validationErrors 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: "User already exists",
                errors: ["Email or username already taken"] 
            });
        }

        // Generate verification code
        const verificationCode = generateOTP();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create user (unverified)
        const newUser = new User({
            clerkId: `temp_${Date.now()}`, // Will be updated after email verification
            email,
            username,
            firstName: "",
            lastName: "",
            profileImage: "",
            isEmailVerified: false,
            emailVerificationCode: verificationCode,
            emailVerificationExpires: verificationExpires
        });

        await newUser.save();

        // Send verification email
        await sendVerificationEmail(email, verificationCode);

        res.status(201).json({
            success: true,
            message: "Registration successful. Please check your email for verification code.",
            userId: newUser._id,
            email: newUser.email
        });

    } catch (error) {
        console.log("Error in register controller", error.message);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error",
            errors: [error.message]
        });
    }
});

// ─── POST /api/auth/verify-email ───
// Verify email with OTP
router.post("/verify-email", async (req, res) => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            return res.status(400).json({
                success: false,
                message: "User ID and verification code are required"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified"
            });
        }

        // Check if code matches
        if (user.emailVerificationCode !== code) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification code"
            });
        }

        // Check if code expired
        if (new Date() > user.emailVerificationExpires) {
            return res.status(400).json({
                success: false,
                message: "Verification code expired. Please request a new one."
            });
        }

        // Mark as verified
        user.isEmailVerified = true;
        user.emailVerificationCode = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Generate token (you can use JWT here)
        const token = `token_${user._id}_${Date.now()}`;

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                isEmailVerified: true
            }
        });

    } catch (error) {
        console.log("Error in verify-email controller", error.message);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error"
        });
    }
});

// ─── POST /api/auth/resend-code ───
// Resend verification code
router.post("/resend-code", async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified"
            });
        }

        // Generate new code
        const newCode = generateOTP();
        user.emailVerificationCode = newCode;
        user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        // Resend email
        await sendVerificationEmail(user.email, newCode);

        res.status(200).json({
            success: true,
            message: "Verification code resent. Please check your email."
        });

    } catch (error) {
        console.log("Error in resend-code controller", error.message);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error"
        });
    }
});

// ─── POST /api/auth/login ───
// Login with email + password (after verification)
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in",
                needsVerification: true,
                userId: user._id
            });
        }

        // Verify password (you need to hash/compare here)
        // For now, this is a placeholder - use bcrypt in production
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate token
        const token = `token_${user._id}_${Date.now()}`;

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                isEmailVerified: user.isEmailVerified
            }
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error"
        });
    }
});

// ─── POST /api/auth/forgot-password ───
// Request password reset code
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email"
            });
        }

        // Generate reset code
        const resetCode = generateOTP();
        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        // Send reset email
        await sendPasswordResetEmail(email, resetCode);

        res.status(200).json({
            success: true,
            message: "Password reset code sent to your email"
        });

    } catch (error) {
        console.log("Error in forgot-password controller", error.message);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error"
        });
    }
});

// ─── POST /api/auth/reset-password ───
// Reset password with code
router.post("/reset-password", async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        // Validate new password
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify code
        if (user.resetPasswordCode !== code) {
            return res.status(400).json({
                success: false,
                message: "Invalid reset code"
            });
        }

        if (new Date() > user.resetPasswordExpires) {
            return res.status(400).json({
                success: false,
                message: "Reset code expired"
            });
        }

        // Update password (hash it in production)
        user.password = newPassword; // Use bcrypt here!
        user.resetPasswordCode = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful"
        });

    } catch (error) {
        console.log("Error in reset-password controller", error.message);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error"
        });
    }
});

// ─── GET /api/auth/me ───
// Get current user (protected)
router.get("/me", async (req, res) => {
    try {
        const { isAuthenticated, userId } = getAuth(req);
        
        if (!isAuthenticated) {
            return res.status(401).json({ 
                success: false,
                message: "Not authenticated" 
            });
        }

        const user = await User.findOne({ clerkId: userId });
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            }
        });

    } catch (error) {
        console.log("Error in me controller", error.message);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
});

export default router;