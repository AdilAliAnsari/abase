/**
 * aiRoutes.js — plug-in route for your existing abase Express backend.
 *
 * INSTALL
 *   1. Copy this file to  backend/src/routes/aiRoutes.js
 *   2. In backend/src/index.js add:
 *        import aiRoutes from "./routes/aiRoutes.js";
 *        ...
 *        app.use("/api/ai", aiRoutes);
 *   3. Add to your .env:
 *        LLM_SERVER_URL=http://localhost:8000
 *   4. (Optional) protect with Clerk:
 *        import { requireAuth } from "@clerk/express";
 *        router.post("/chat", requireAuth(), chatHandler);
 *
 * The frontend calls POST /api/ai/chat — your Express server proxies the
 * request to the Python LLM server and streams tokens back (SSE).
 */
import { Router } from "express";

const router = Router();
const LLM_URL = process.env.LLM_SERVER_URL || "http://localhost:8000";

/* health check — lets the app verify the LLM is up */
router.get("/health", async (req, res, next) => {
    try {
        const r = await fetch(`${LLM_URL}/health`);
        const data = await r.json();
        res.json({ success: true, llm: data });
    } catch (err) {
        res.status(503).json({ success: false, error: "LLM server unreachable" });
    }
});

/* chat — non-streaming + streaming in one endpoint */
export const chatHandler = async (req, res, next) => {
    try {
        const { messages, stream = true, max_tokens = 512,
                temperature = 0.8, top_p = 0.9 } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ success: false, error: "messages[] required" });
        }

        const upstream = await fetch(`${LLM_URL}/v1/chat/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages, stream, max_tokens, temperature, top_p })
        });

        if (!upstream.ok) {
            const text = await upstream.text();
            return res.status(upstream.status).json({ success: false, error: text });
        }

        if (stream) {
            // pipe SSE straight through to the client
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.flushHeaders();
            const reader = upstream.body.getReader();
            const pump = () =>
                reader.read().then(({ done, value }) => {
                    if (done) return res.end();
                    res.write(Buffer.from(value));
                    return pump();
                });
            pump().catch(() => res.end());
        } else {
            const data = await upstream.json();
            res.json({ success: true, data });
        }
    } catch (err) {
        next(err);
    }
};

router.post("/chat", chatHandler);

export default router;
