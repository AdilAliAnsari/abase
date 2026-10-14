import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    clerkId: { type: String, sparse: true, index: true },
    username: { 
        type: String, 
        required: true, 
        unique: true,
        minlength: [3, "Username must be at least 3 characters"],
        maxlength: [30, "Username cannot exceed 30 characters"],
        match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"]
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    password: {
        type: String,
        minlength: [6, "Password must be at least 6 characters"]
    },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    
    // Email verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationCode: { type: String },
    emailVerificationExpires: { type: Date },
    
    // Social authentication & provider
    provider: { type: String, enum: ["local", "google", "github"], default: "local" },
    socialId: { type: String, sparse: true, index: true },
    lastLoginAt: { type: Date, default: Date.now },

    // Password reset
    resetPasswordCode: { type: String },
    resetPasswordExpires: { type: Date },
    
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
}, { timestamps: true });

// Pre-save hook: Hash password if modified
userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw err;
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export { User };
export default User;