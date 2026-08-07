import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import { connectDB } from "./lib/db.js";

// Load env vars FIRST before anything else
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/pdf", pdfRoutes);


// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server is running",
        clerkApp: process.env.CLERK_APP_ID || "not set"
    });
});

// Error handlers
app.use((err, req, res, next) => {
    console.error("Error:", err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || "Internal Server Error"
    });
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Clerk App: ${process.env.CLERK_APP_ID || "NOT SET"}`);
    connectDB();
});