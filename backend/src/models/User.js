import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true, index: true },
    username: { 
        type: String, 
        required: true, 
        unique: true,
        minlength: [8, "Username must be at least 8 characters"],
        maxlength: [30, "Username cannot exceed 30 characters"],
        match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"]
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    
    // Email verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationCode: { type: String },
    emailVerificationExpires: { type: Date },
    
    // Password reset
    resetPasswordCode: { type: String },
    resetPasswordExpires: { type: Date },
    
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export { User };