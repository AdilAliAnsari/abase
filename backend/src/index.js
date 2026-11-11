import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { connectDB, getDbStatus } from "./lib/db.js";
import { initPdfScanner } from "./services/pdfScanner.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf.toString(); } }));
app.use(clerkMiddleware());

// Health check and diagnostic for mobile connection testing
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Abase API Backend is running",
        version: "1.0.0",
        db: getDbStatus()
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        db: getDbStatus(),
        endpoints: {
            auth: ["/api/auth/register", "/api/auth/login", "/api/auth/verify-email", "/api/auth/me"],
            books: ["/api/books", "/api/books/:id"],
            pdfs: ["/api/pdfs", "/api/pdfs/:id", "/api/pdfs/:id/download", "/api/pdfs/scan"],
            orders: ["/api/orders", "/api/orders/:id"],
            payments: ["/api/payments/create-order", "/api/payments/verify", "/api/payments/:orderId"],
            cart: ["/api/cart", "/api/cart/add", "/api/cart/update", "/api/cart/remove/:bookId", "/api/cart/clear"],
            notifications: ["/api/notifications", "/api/notifications/:id/read"],
            ai: ["/api/ai/health", "/api/ai/chat"]
        }
    });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/pdfs", pdfRoutes);
app.use("/api/pdf", pdfRoutes); // backward compatibility
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({ success: false, error: err.message || "Internal Server Error" });
});
app.use((req, res) => res.status(404).json({ success: false, error: "Route not found" }));

app.use((req, res) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

// Start server listening on all network interfaces
app.listen(PORT, "0.0.0.0", async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 LAN / Mobile access on http://0.0.0.0:${PORT}`);
    await connectDB();
    initPdfScanner();
});