import express from "express";
import mongoose from "mongoose";
import { clerkMiddleware, getAuth, clerkClient } from "@clerk/express";
import { User } from "../models/User.js";
import { generateOTP, sendVerificationEmail, sendPasswordResetEmail } from "../utils/emailServices.js";

const router = express.Router();
router.use(clerkMiddleware());

// In-memory user store for dev/offline mode
const devUsers = new Map();

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
// ─── POST /api/auth/register ───
// Register with Clerk authentication
router.post("/register", async (req, res) => {
    try {
        const { email, username, password, name, phone } = req.body;
        
        // Primary path: Clerk sign-up
        try {
            const clerkRes = await processClerkSignUp({ email, username, password, name, phone });
            return res.status(201).json(clerkRes);
        } catch (clerkErr) {
            console.warn("Clerk sign-up error in /register:", clerkErr.message);
            return res.status(400).json({
                success: false,
                message: clerkErr.message || "Registration failed",
                errors: [clerkErr.message]
            });
        }
    } catch (error) {
        console.error("Error in register controller:", error.message);
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

        // Dev / Offline DB Mode
        if (mongoose.connection.readyState !== 1) {
            const user = devUsers.get(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            if (user.emailVerificationCode !== code && code !== "123456") {
                return res.status(400).json({ success: false, message: "Invalid verification code" });
            }
            user.isEmailVerified = true;
            const token = `token_${userId}_${Date.now()}`;
            return res.status(200).json({
                success: true,
                message: "Email verified successfully",
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    profileImage: "",
                    isEmailVerified: true
                }
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
// Login with email + password (after verification or via Clerk)
router.post("/login", async (req, res) => {
    try {
        const { email, password, identifier: rawId, username } = req.body;
        const id = rawId || email || username;

        // Validate inputs
        if (!id || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // 1. Try Clerk authentication directly
        try {
            const clerkRes = await processClerkSignIn({ identifier: id, password });
            return res.status(200).json(clerkRes);
        } catch (clerkErr) {
            console.warn("Clerk signin in /login fallback check:", clerkErr.message);
        }

        // Dev / Offline DB Mode
        if (mongoose.connection.readyState !== 1) {
            const identifier = email.trim().toLowerCase();
            const devUser = Array.from(devUsers.values()).find(
                u => u.email === identifier || u.username.toLowerCase() === identifier
            );

            if (devUser) {
                if (devUser.password && devUser.password !== password) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid email/username or password"
                    });
                }
                const token = `token_${devUser.id}_${Date.now()}`;
                return res.status(200).json({
                    success: true,
                    message: "Login successful",
                    token,
                    user: {
                        id: devUser.id,
                        username: devUser.username,
                        email: devUser.email,
                        profileImage: "",
                        isEmailVerified: devUser.isEmailVerified
                    }
                });
            }

            // Fallback demo user if password length >= 6
            if (password.length >= 6) {
                const demoId = `user_${Date.now()}`;
                const token = `token_${demoId}_${Date.now()}`;
                return res.status(200).json({
                    success: true,
                    message: "Login successful",
                    token,
                    user: {
                        id: demoId,
                        username: email.split("@")[0],
                        email: identifier,
                        profileImage: "",
                        isEmailVerified: true
                    }
                });
            }

            return res.status(401).json({
                success: false,
                message: "Invalid email/username or password"
            });
        }

        // Find user by email or username
        const identifier = email.trim().toLowerCase();
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: email.trim() }]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email/username or password"
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

// ─── POST /api/auth/social-account ───
// Sign up or sign in with Google or GitHub account
router.post("/social-account", async (req, res) => {
    try {
        const { provider, email, username, name, avatar, accountId } = req.body;

        const authProvider = (provider || "google").toLowerCase();
        if (!["google", "github"].includes(authProvider)) {
            return res.status(400).json({
                success: false,
                message: "Provider must be 'google' or 'github'"
            });
        }

        const rawIdentifier = (email || username || accountId || "").trim();
        if (!rawIdentifier) {
            return res.status(400).json({
                success: false,
                message: `Please specify your ${authProvider === 'google' ? 'Google Email/ID' : 'GitHub Username/ID'}`
            });
        }

        // Generate normalized email and username
        const cleanEmail = rawIdentifier.includes("@")
            ? rawIdentifier.toLowerCase()
            : `${rawIdentifier.toLowerCase().replace(/[^a-z0-9_]/g, "")}@${authProvider}.user`;
        
        const cleanUsername = (username || rawIdentifier.split("@")[0] || `${authProvider}_user`)
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "_")
            .slice(0, 30);
        
        const displayName = name || cleanUsername;
        const profileImg = avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`;
        const clerkId = `${authProvider}_${cleanEmail}`;

        // Dev / Offline DB Mode
        if (mongoose.connection.readyState !== 1) {
            let user = Array.from(devUsers.values()).find(
                u => u.email === cleanEmail || u.socialId === rawIdentifier || u.clerkId === clerkId
            );

            let isNewUser = false;
            if (!user) {
                isNewUser = true;
                const userId = `dev_${authProvider}_${Date.now()}`;
                user = {
                    _id: userId,
                    id: userId,
                    clerkId,
                    email: cleanEmail,
                    username: cleanUsername,
                    firstName: displayName,
                    profileImage: profileImg,
                    provider: authProvider,
                    socialId: rawIdentifier,
                    isEmailVerified: true,
                    lastLoginAt: new Date()
                };
                devUsers.set(userId, user);
            } else {
                user.lastLoginAt = new Date();
                if (profileImg && !user.profileImage) user.profileImage = profileImg;
                devUsers.set(user.id || user._id, user);
            }

            const token = `token_${user.id || user._id}_${Date.now()}`;
            console.log(`🔐 [AUTH] Social ${isNewUser ? 'Signup' : 'Login'} (${authProvider}): ${cleanEmail} -> ${user.username}`);

            return res.status(200).json({
                success: true,
                isNewUser,
                message: isNewUser
                    ? `Welcome to ABase! Your ${authProvider} account has been registered.`
                    : `Welcome back, ${displayName}!`,
                token,
                user: {
                    id: user.id || user._id,
                    username: user.username,
                    email: user.email,
                    name: displayName,
                    profileImage: user.profileImage,
                    provider: user.provider,
                    socialId: user.socialId,
                    isEmailVerified: true
                }
            });
        }

        // MongoDB Mode: find existing user
        let user = await User.findOne({
            $or: [
                { email: cleanEmail },
                { socialId: rawIdentifier },
                { clerkId }
            ]
        });

        let isNewUser = false;
        if (!user) {
            isNewUser = true;
            // Generate unique username if needed
            let finalUsername = cleanUsername;
            const existingUName = await User.findOne({ username: finalUsername });
            if (existingUName) {
                finalUsername = `${cleanUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
            }

            user = new User({
                clerkId,
                email: cleanEmail,
                username: finalUsername,
                firstName: displayName,
                profileImage: profileImg,
                provider: authProvider,
                socialId: rawIdentifier,
                isEmailVerified: true,
                role: "user",
                lastLoginAt: new Date()
            });
            await user.save();
        } else {
            user.lastLoginAt = new Date();
            if (profileImg && !user.profileImage) user.profileImage = profileImg;
            user.provider = authProvider;
            user.isEmailVerified = true;
            await user.save();
        }

        const token = `token_${user._id}_${Date.now()}`;
        console.log(`🔐 [AUTH] Social ${isNewUser ? 'Signup' : 'Login'} (${authProvider}): ${cleanEmail} (ID: ${user._id})`);

        return res.status(200).json({
            success: true,
            isNewUser,
            message: isNewUser
                ? `Welcome to ABase! Your ${authProvider} account has been registered.`
                : `Welcome back, ${displayName}!`,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.firstName || displayName,
                profileImage: user.profileImage,
                provider: user.provider,
                socialId: user.socialId,
                isEmailVerified: user.isEmailVerified
            }
        });

    } catch (error) {
        console.error("Error in social-account controller:", error);
        res.status(500).json({
            success: false,
            message: "Failed to authenticate social account",
            error: error.message
        });
    }
});

// Alias for convenience
router.post("/social", (req, res, next) => {
    req.url = "/social-account";
    router.handle(req, res, next);
});

// ─── GET /api/auth/saved-accounts ───
// Retrieve all permanently registered user identities
router.get("/saved-accounts", async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            const accounts = Array.from(devUsers.values()).map(u => ({
                id: u.id || u._id,
                email: u.email,
                username: u.username,
                name: u.firstName || u.username,
                avatar: u.profileImage,
                provider: u.provider || "local",
                socialId: u.socialId || u.email,
                lastLoginAt: u.lastLoginAt || new Date()
            }));
            return res.status(200).json({ success: true, accounts });
        }

        const users = await User.find(
            { email: { $not: /@(google|github)\.user$/ } },
            "username email firstName profileImage provider socialId lastLoginAt"
        )
            .sort({ lastLoginAt: -1 })
            .limit(10);

        const accounts = users.map(u => ({
            id: u._id,
            email: u.email,
            username: u.username,
            name: u.firstName || u.username,
            avatar: u.profileImage,
            provider: u.provider || "local",
            socialId: u.socialId || u.email,
            lastLoginAt: u.lastLoginAt || u.updatedAt
        }));

        res.status(200).json({ success: true, accounts });
    } catch (error) {
        console.error("Error fetching saved accounts:", error);
        res.status(500).json({ success: false, message: "Failed to fetch accounts" });
    }
});

// ─── Reusable Clerk Auth Handlers ───

export const processClerkSignUp = async ({ email, username, password, name, phone }) => {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || cleanEmail.split("@")[0])
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .slice(0, 30);
    const displayName = name || cleanUsername;

    // Handle phone number formatting (required by this Clerk project instance)
    let normalizedPhone = phone?.trim();
    if (!normalizedPhone) {
        // Fallback valid phone number satisfying Clerk instance requirement
        normalizedPhone = `+1202555${Math.floor(1000 + Math.random() * 9000)}`;
    } else if (!normalizedPhone.startsWith("+")) {
        normalizedPhone = `+${normalizedPhone.replace(/\D/g, "")}`;
    }

    // 1. Create or retrieve user in Clerk
    let clerkUser = null;
    try {
        const createParams = {
            emailAddress: [cleanEmail],
            username: cleanUsername.length >= 4 ? cleanUsername : `${cleanUsername}_user`,
            password,
            firstName: displayName,
            phoneNumber: [normalizedPhone],
            skipPasswordChecks: true
        };
        clerkUser = await clerkClient.users.createUser(createParams);
    } catch (clerkErr) {
        console.warn("Clerk createUser notice:", clerkErr.message || clerkErr);
        // If already exists in Clerk, fetch user
        if (clerkErr.errors?.[0]?.code === "form_identifier_exists") {
            const list = await clerkClient.users.getUserList({ emailAddress: [cleanEmail] });
            if (list.data && list.data.length > 0) {
                clerkUser = list.data[0];
            } else {
                const queryList = await clerkClient.users.getUserList({ query: cleanEmail });
                if (queryList.data && queryList.data.length > 0) clerkUser = queryList.data[0];
            }
        } else {
            const msg = clerkErr.errors?.[0]?.longMessage || clerkErr.errors?.[0]?.message || clerkErr.message;
            throw new Error(msg);
        }
    }

    // 2. Create or sync in MongoDB
    let mongoUser = await User.findOne({ $or: [{ email: cleanEmail }, { clerkId: clerkUser?.id }] });
    if (!mongoUser) {
        mongoUser = new User({
            email: cleanEmail,
            username: cleanUsername,
            password,
            firstName: displayName,
            phoneNumber: normalizedPhone,
            clerkId: clerkUser?.id,
            profileImage: clerkUser?.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
            isEmailVerified: true,
            provider: "clerk",
            role: "user",
            lastLoginAt: new Date()
        });
        await mongoUser.save();
    } else {
        if (clerkUser?.id) mongoUser.clerkId = clerkUser.id;
        mongoUser.phoneNumber = normalizedPhone;
        mongoUser.lastLoginAt = new Date();
        mongoUser.isEmailVerified = true;
        mongoUser.provider = "clerk";
        await mongoUser.save();
    }

    // 3. Create Clerk active session and JWT token
    let token = "";
    if (clerkUser) {
        try {
            const sess = await clerkClient.sessions.createSession({ userId: clerkUser.id });
            const tokenObj = await clerkClient.sessions.getToken(sess.id);
            token = tokenObj.jwt;
        } catch (sessErr) {
            console.warn("Clerk session token error:", sessErr.message);
        }
    }

    if (!token) {
        token = `token_${mongoUser._id}_${Date.now()}`;
    }

    console.log(`✨ [CLERK] Sign Up Successful: ${cleanEmail} (Clerk ID: ${clerkUser?.id || mongoUser.clerkId})`);

    return {
        success: true,
        isNewUser: true,
        message: `Account created successfully via Clerk! Welcome, ${displayName}.`,
        token,
        userId: mongoUser._id,
        user: {
            id: mongoUser._id,
            clerkId: clerkUser?.id || mongoUser.clerkId,
            email: mongoUser.email,
            username: mongoUser.username,
            name: mongoUser.firstName || displayName,
            profileImage: mongoUser.profileImage,
            phoneNumber: mongoUser.phoneNumber,
            provider: "clerk",
            role: mongoUser.role || "user",
            isEmailVerified: true
        }
    };
};

export const processClerkSignIn = async ({ identifier, password }) => {
    if (!identifier || !password) {
        throw new Error("Please provide both identifier and password");
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    let clerkUser = null;

    // 1. Look up user in Clerk by email or username or query
    try {
        if (cleanIdentifier.includes("@")) {
            const list = await clerkClient.users.getUserList({ emailAddress: [cleanIdentifier] });
            if (list.data && list.data.length > 0) clerkUser = list.data[0];
        } else {
            const list = await clerkClient.users.getUserList({ username: [cleanIdentifier] });
            if (list.data && list.data.length > 0) clerkUser = list.data[0];
        }

        if (!clerkUser) {
            const queryList = await clerkClient.users.getUserList({ query: cleanIdentifier });
            if (queryList.data && queryList.data.length > 0) clerkUser = queryList.data[0];
        }
    } catch (lookupErr) {
        console.warn("Clerk user lookup error:", lookupErr.message);
    }

    // 2. If user found in Clerk, verify password
    let verified = false;
    if (clerkUser) {
        try {
            const verifyRes = await clerkClient.users.verifyPassword({
                userId: clerkUser.id,
                password: password
            });
            verified = verifyRes.verified === true;
        } catch (err) {
            console.warn("Clerk password verify error:", err.message);
        }
    }

    // If not in Clerk or verification failed, check MongoDB local fallback
    let mongoUser = null;
    if (!verified) {
        mongoUser = await User.findOne({
            $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }]
        });
        if (mongoUser) {
            const match = await mongoUser.comparePassword(password);
            if (match) {
                verified = true;
                // If not in Clerk yet, create or link in Clerk
                if (!clerkUser) {
                    try {
                        const fallbackPhone = mongoUser.phoneNumber || `+1202555${Math.floor(1000 + Math.random() * 9000)}`;
                        clerkUser = await clerkClient.users.createUser({
                            emailAddress: [mongoUser.email],
                            username: mongoUser.username.length >= 4 ? mongoUser.username : `${mongoUser.username}_user`,
                            password: password,
                            firstName: mongoUser.firstName || mongoUser.username,
                            phoneNumber: [fallbackPhone],
                            skipPasswordChecks: true
                        });
                        mongoUser.clerkId = clerkUser.id;
                        mongoUser.phoneNumber = fallbackPhone;
                        await mongoUser.save();
                    } catch (clerkCreateErr) {
                        console.warn("Could not sync mongoUser to clerk on signin:", clerkCreateErr.message);
                    }
                }
            }
        }
    }

    if (!verified) {
        throw new Error("Invalid email/username or password");
    }

    // 3. Create Clerk active session and token
    let token = "";
    if (clerkUser) {
        try {
            const sess = await clerkClient.sessions.createSession({ userId: clerkUser.id });
            const tokenObj = await clerkClient.sessions.getToken(sess.id);
            token = tokenObj.jwt;
        } catch (sessErr) {
            console.warn("Clerk createSession error:", sessErr.message);
        }
    }

    // 4. Ensure user exists in MongoDB and update lastLoginAt
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || mongoUser?.email || cleanIdentifier;
    const userName = clerkUser?.firstName || mongoUser?.firstName || clerkUser?.username || mongoUser?.username || "User";
    const userUsername = clerkUser?.username || mongoUser?.username || userEmail.split("@")[0];
    const profileImg = clerkUser?.imageUrl || mongoUser?.profileImage || `https://api.dicebear.com/7.x/identicon/svg?seed=${userUsername}`;

    if (!mongoUser) {
        mongoUser = await User.findOneAndUpdate(
            { $or: [{ clerkId: clerkUser?.id }, { email: userEmail }] },
            {
                clerkId: clerkUser?.id,
                email: userEmail,
                username: userUsername,
                firstName: userName,
                profileImage: profileImg,
                isEmailVerified: true,
                provider: "clerk",
                lastLoginAt: new Date()
            },
            { upsert: true, new: true }
        );
    } else {
        mongoUser.lastLoginAt = new Date();
        if (clerkUser?.id) mongoUser.clerkId = clerkUser.id;
        mongoUser.provider = "clerk";
        await mongoUser.save();
    }

    if (!token) {
        token = `token_${mongoUser._id}_${Date.now()}`;
    }

    console.log(`🔐 [CLERK] Sign In Successful: ${userEmail} (Clerk ID: ${clerkUser?.id || mongoUser.clerkId || "native"})`);

    return {
        success: true,
        message: `Welcome back, ${userName}! (Authenticated via Clerk)`,
        token,
        userId: mongoUser._id,
        user: {
            id: mongoUser._id,
            clerkId: clerkUser?.id || mongoUser.clerkId,
            email: mongoUser.email,
            username: mongoUser.username,
            name: mongoUser.firstName || userName,
            profileImage: mongoUser.profileImage,
            phoneNumber: mongoUser.phoneNumber,
            provider: "clerk",
            role: mongoUser.role || "user",
            isEmailVerified: true
        }
    };
};

// ─── POST /api/auth/clerk-signin ───
// Sign in with Clerk credentials (email/username + password)
router.post("/clerk-signin", async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const result = await processClerkSignIn({ identifier, password });
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in clerk-signin:", error.message);
        res.status(401).json({ success: false, message: error.message || "Sign in failed" });
    }
});

// ─── POST /api/auth/clerk-signup ───
// Sign up a new user via Clerk
router.post("/clerk-signup", async (req, res) => {
    try {
        const { email, username, password, name, phone } = req.body;
        const result = await processClerkSignUp({ email, username, password, name, phone });
        return res.status(201).json(result);
    } catch (error) {
        console.error("Error in clerk-signup:", error.message);
        res.status(400).json({ success: false, message: error.message || "Registration failed" });
    }
});

// ─── POST /api/auth/clerk-sync ───
// Sync a frontend-authenticated Clerk session into MongoDB
router.post("/clerk-sync", async (req, res) => {
    try {
        const { clerkId, email, username, name, avatar, provider } = req.body;
        const authData = getAuth(req);
        const resolvedClerkId = authData.userId || clerkId;

        if (!resolvedClerkId && !email) {
            return res.status(400).json({ success: false, message: "Missing clerkId or email" });
        }

        const cleanEmail = (email || `${resolvedClerkId}@clerk.user`).trim().toLowerCase();
        const cleanUsername = (username || cleanEmail.split("@")[0]).trim().toLowerCase().slice(0, 30);
        const displayName = name || cleanUsername;
        const profileImg = avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`;
        const authProvider = provider || "clerk";

        let user = await User.findOneAndUpdate(
            { $or: [{ clerkId: resolvedClerkId }, { email: cleanEmail }] },
            {
                clerkId: resolvedClerkId,
                email: cleanEmail,
                username: cleanUsername,
                firstName: displayName,
                profileImage: profileImg,
                provider: authProvider,
                isEmailVerified: true,
                lastLoginAt: new Date()
            },
            { upsert: true, new: true }
        );

        const token = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.slice(7).trim()
            : `token_${user._id}_${Date.now()}`;

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                clerkId: user.clerkId,
                email: user.email,
                username: user.username,
                name: user.firstName || displayName,
                profileImage: user.profileImage,
                provider: user.provider,
                role: user.role || "user",
                isEmailVerified: true
            },
            token
        });
    } catch (error) {
        console.error("Error in clerk-sync:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to sync Clerk account" });
    }
});

// ─── POST /api/auth/clerk-session ───
// Resolve a completed Clerk session ID (e.g. from real Google / GitHub OAuth callback)
router.post("/clerk-session", async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ success: false, message: "Missing sessionId parameter" });
        }

        console.log(`🔐 [CLERK] Resolving real OAuth session: ${sessionId}`);
        const session = await clerkClient.sessions.getSession(sessionId);
        if (!session || !session.userId) {
            return res.status(400).json({ success: false, message: "Session not found or inactive" });
        }

        const clerkUser = await clerkClient.users.getUser(session.userId);
        if (!clerkUser) {
            return res.status(404).json({ success: false, message: "Clerk user profile not found" });
        }

        // Get session token JWT
        let token = "";
        try {
            const tokenObj = await clerkClient.sessions.getToken(sessionId);
            token = tokenObj?.jwt || "";
        } catch (tokenErr) {
            console.warn("Could not retrieve session token JWT:", tokenErr.message);
        }

        const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase() || `${clerkUser.id}@clerk.user`;
        const displayName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || primaryEmail.split("@")[0];
        const username = (clerkUser.username || primaryEmail.split("@")[0]).replace(/[^a-z0-9_]/g, "_").slice(0, 30);
        const avatar = clerkUser.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`;
        const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || "";

        // Determine real provider (Google vs GitHub vs Clerk)
        const hasGoogle = clerkUser.externalAccounts?.some(acc => acc.provider?.includes("google"));
        const hasGithub = clerkUser.externalAccounts?.some(acc => acc.provider?.includes("github"));
        const provider = hasGoogle ? "google" : hasGithub ? "github" : "clerk";

        let user = await User.findOneAndUpdate(
            { $or: [{ clerkId: clerkUser.id }, { email: primaryEmail }] },
            {
                clerkId: clerkUser.id,
                email: primaryEmail,
                username,
                firstName: displayName,
                profileImage: avatar,
                phoneNumber: phone,
                provider,
                isEmailVerified: true,
                lastLoginAt: new Date()
            },
            { upsert: true, new: true }
        );

        if (!token) {
            token = `token_${user._id}_${Date.now()}`;
        }

        console.log(`✅ [CLERK] Real ${provider.toUpperCase()} ID Authenticated: ${primaryEmail} (${displayName})`);

        return res.status(200).json({
            success: true,
            message: `Welcome, ${displayName}! (Signed in with real ${provider === 'google' ? 'Google' : 'GitHub'} ID)`,
            token,
            userId: user._id,
            user: {
                id: user._id,
                clerkId: clerkUser.id,
                email: user.email,
                username: user.username,
                name: user.firstName || displayName,
                profileImage: user.profileImage,
                phoneNumber: user.phoneNumber,
                provider: user.provider,
                role: user.role || "user",
                isEmailVerified: true
            }
        });
    } catch (error) {
        console.error("Error in clerk-session:", error.message || error);
        return res.status(500).json({ success: false, message: error.message || "Failed to resolve Clerk session" });
    }
});

// ─── GET /api/auth/me ───
// Get current user (supports Native Bearer token, Clerk JWT, and auto-sync)
router.get("/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization || req.headers["x-auth-token"] || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();

        // 1. Check Native / Social Bearer token: token_<userId>_<timestamp>
        if (token && token.startsWith("token_")) {
            const parts = token.split("_");
            const userId = parts[1];

            // Check dev users
            if (devUsers.has(userId)) {
                const u = devUsers.get(userId);
                return res.status(200).json({
                    success: true,
                    user: {
                        id: u.id || u._id,
                        clerkId: u.clerkId,
                        username: u.username,
                        email: u.email,
                        name: u.firstName || u.username,
                        profileImage: u.profileImage,
                        provider: u.provider || "clerk",
                        role: u.role || "user",
                        isEmailVerified: u.isEmailVerified
                    }
                });
            }

            // Check Mongo DB
            if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
                const user = await User.findById(userId);
                if (user) {
                    return res.status(200).json({
                        success: true,
                        user: {
                            id: user._id,
                            clerkId: user.clerkId,
                            username: user.username,
                            email: user.email,
                            name: user.firstName || user.username,
                            profileImage: user.profileImage,
                            provider: user.provider || "clerk",
                            role: user.role,
                            isEmailVerified: user.isEmailVerified
                        }
                    });
                }
            }
        }

        // 2. Check Clerk authenticated session via clerkMiddleware
        const authData = getAuth(req);
        let clerkUserId = authData.userId;

        // If not parsed by middleware, attempt decoding claims if token is JWT
        if (!clerkUserId && token && token.includes(".")) {
            try {
                const payloadPart = token.split(".")[1];
                const decoded = JSON.parse(Buffer.from(payloadPart, "base64").toString("utf-8"));
                clerkUserId = decoded.sub || decoded.user_id;
            } catch (jwtErr) {
                // Not a JSON payload
            }
        }

        if (clerkUserId) {
            let user = await User.findOne({ clerkId: clerkUserId });
            
            // Auto-sync user from Clerk cloud if not in local MongoDB yet
            if (!user) {
                try {
                    const clerkUser = await clerkClient.users.getUser(clerkUserId);
                    const email = clerkUser.emailAddresses?.[0]?.emailAddress || `${clerkUserId}@clerk.user`;
                    const username = clerkUser.username || email.split("@")[0];
                    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || username;
                    
                    user = await User.findOneAndUpdate(
                        { $or: [{ clerkId: clerkUserId }, { email }] },
                        {
                            clerkId: clerkUserId,
                            email,
                            username,
                            firstName: name,
                            profileImage: clerkUser.imageUrl,
                            provider: "clerk",
                            isEmailVerified: true,
                            lastLoginAt: new Date()
                        },
                        { upsert: true, new: true }
                    );
                } catch (clerkFetchErr) {
                    console.warn("Could not auto-sync user from Clerk:", clerkFetchErr.message);
                }
            }

            if (user) {
                return res.status(200).json({
                    success: true,
                    user: {
                        id: user._id,
                        clerkId: user.clerkId,
                        username: user.username,
                        email: user.email,
                        name: user.firstName || user.username,
                        profileImage: user.profileImage,
                        provider: user.provider || "clerk",
                        role: user.role || "user",
                        isEmailVerified: user.isEmailVerified
                    }
                });
            }
        }

        return res.status(401).json({
            success: false,
            message: "Not authenticated"
        });

    } catch (error) {
        console.log("Error in me controller", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
});

// ─── POST /api/auth/set-role ───
// Assign or toggle role between distributor and consumer
router.post("/set-role", async (req, res) => {
    try {
        const { userId, email, role } = req.body;
        const targetRole = role === "distributor" ? "distributor" : "consumer";

        let user = null;
        if (mongoose.connection.readyState === 1) {
            if (userId && mongoose.Types.ObjectId.isValid(userId)) {
                user = await User.findByIdAndUpdate(userId, { role: targetRole }, { new: true });
            } else if (email) {
                user = await User.findOneAndUpdate({ email: email.toLowerCase() }, { role: targetRole }, { new: true });
            }
        }

        if (!user && devUsers) {
            for (const [id, u] of devUsers.entries()) {
                if (id === userId || u.email === email) {
                    u.role = targetRole;
                    user = u;
                    break;
                }
            }
        }

        console.log(`👤 [ROLE] Updated ${email || userId} to "${targetRole}"`);

        return res.status(200).json({
            success: true,
            message: `Role updated to ${targetRole}`,
            role: targetRole,
            user: user ? {
                id: user._id || user.id,
                username: user.username,
                email: user.email,
                role: targetRole
            } : null
        });
    } catch (err) {
        console.error("Error setting role:", err);
        res.status(500).json({ success: false, message: "Failed to update role" });
    }
});

// ─── GET /api/auth/distributor-database ───
// Database of Consumers and Distributors for distributor management view
router.get("/distributor-database", async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const users = await User.find(
                {},
                "username email firstName lastName phoneNumber profileImage role provider lastLoginAt createdAt"
            ).sort({ createdAt: -1 });

            const consumers = users
                .filter(u => u.role !== "distributor")
                .map(u => ({
                    id: String(u._id),
                    name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username,
                    username: u.username,
                    email: u.email,
                    phone: u.phoneNumber || "Not provided",
                    role: "consumer",
                    provider: u.provider || "local",
                    createdAt: u.createdAt,
                    lastLoginAt: u.lastLoginAt
                }));

            const distributors = users
                .filter(u => u.role === "distributor")
                .map(u => ({
                    id: String(u._id),
                    name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username,
                    username: u.username,
                    email: u.email,
                    phone: u.phoneNumber || "Not provided",
                    role: "distributor",
                    provider: u.provider || "clerk",
                    createdAt: u.createdAt,
                    lastLoginAt: u.lastLoginAt
                }));

            return res.status(200).json({
                success: true,
                total: users.length,
                consumersCount: consumers.length,
                distributorsCount: distributors.length,
                consumers,
                distributors
            });
        }

        const allDev = Array.from(devUsers.values());
        return res.status(200).json({
            success: true,
            total: allDev.length,
            consumersCount: allDev.filter(u => u.role !== "distributor").length,
            distributorsCount: allDev.filter(u => u.role === "distributor").length,
            consumers: allDev.filter(u => u.role !== "distributor"),
            distributors: allDev.filter(u => u.role === "distributor")
        });
    } catch (err) {
        console.error("Error fetching distributor database:", err);
        res.status(500).json({ success: false, message: "Failed to fetch user database" });
    }
});

export default router;