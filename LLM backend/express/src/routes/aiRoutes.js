/**
 * aiRoutes.js — Express route bridge between Mobile App and LLM Services.
 *
 * Core Capabilities:
 *   1. Auto-Agent Mode Detection (Auto ➔ Coder / Research / Agent / Chat)
 *   2. Live Web Search & Verified Website Links generation
 *   3. Deep Definitions, Meanings & Structured Explanations
 *   4. Visual Flowchart & Mermaid Diagram Generation
 *   5. Fullstack Coding & Algorithm Synthesis
 *   6. Multi-Provider Support (Gemini API, Groq, OpenAI, Ollama, Python 2B LLM)
 */
import { Router } from "express";
import { searchLiveWeb } from "../../../../backend/src/services/webSearchService.js";

const router = Router();
const LLM_URL = process.env.LLM_SERVER_URL || "http://localhost:8000";

/* Auto agent mode classifier */
export function detectAgentMode(prompt = "") {
    const p = prompt.toLowerCase();
    if (p.includes("flow chart") || p.includes("flowchart") || p.includes("diagram") || p.includes("workflow")) {
        return "Agent";
    }
    if (p.includes("search") || p.includes("web") || p.includes("website") || p.includes("link") || p.includes("links") || p.includes("url")) {
        return "Research";
    }
    if (p.includes("code") || p.includes("program") || p.includes("function") || p.includes("swap") || p.includes("sort") || p.includes("algorithm") || p.includes("debug")) {
        return "Coder";
    }
    return "Chat";
}

/* Health check endpoint */
router.get("/health", async (req, res) => {
    return res.json({
        success: true,
        status: "online",
        provider: "abase-unified-engine",
        features: ["auto-agent-mode", "web-search-grounding", "flowchart-generation", "definition-meaning-engine", "code-generator"]
    });
});

export const chatHandler = async (req, res, next) => {
    try {
        const { messages, stream = false, agentMode = "Auto", modelMode = "Auto" } = req.body;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ success: false, error: "messages array is required" });
        }

        const lastMessage = messages[messages.length - 1]?.content || "";
        const resolvedMode = (agentMode === "Auto" || !agentMode) ? detectAgentMode(lastMessage) : agentMode;

        // Upstream call to primary backend
        const primaryRes = await fetch("http://localhost:3000/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages, stream, agentMode: resolvedMode, modelMode })
        });

        if (primaryRes.ok) {
            const data = await primaryRes.json();
            return res.json(data);
        }

        return res.status(500).json({ success: false, error: "Failed to process chat" });
    } catch (err) {
        next(err);
    }
};

router.post("/chat", chatHandler);

export default router;
