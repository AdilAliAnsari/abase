"""
ABase-LLM inference server — OpenAI-compatible API with SSE streaming.

Run:
    python server.py --ckpt checkpoints/ckpt_030000.pt \
        --tokenizer meta-llama/Llama-3.2-1B --port 8000

Your Express backend proxies to this (see aiRoutes.js). Endpoints:
    GET  /health
    POST /v1/chat/completions   {"messages":[...], "stream":true, ...}
"""

import argparse
import json
import torch
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from transformers import AutoTokenizer

from model import ABaseLLM, ModelConfig

app = FastAPI(title="ABase-LLM")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

MODEL = None
TOK = None
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MAX_CTX = 4096

SYS_PROMPT = "You are ABase AI, a helpful assistant."


class ChatRequest(BaseModel):
    messages: list[dict]
    max_tokens: int = 512
    temperature: float = 0.8
    top_p: float = 0.9
    stream: bool = False


def build_prompt(messages):
    text = "<|begin_of_text|>"
    text += f"<|im_start|>system\n{SYS_PROMPT}<|im_end|>\n"
    for m in messages:
        text += f"<|im_start|>{m['role']}\n{m['content']}<|im_end|>\n"
    text += "<|im_start|>assistant\n"
    return text


@app.get("/health")
def health():
    return {"ok": True, "model": "abase-llm-2b", "device": DEVICE,
            "context": MAX_CTX}


@app.post("/v1/chat/completions")
async def chat(req: ChatRequest):
    prompt = build_prompt(req.messages)
    ids = torch.tensor([TOK.encode(prompt)], device=DEVICE)
    eos = TOK.convert_tokens_to_ids("<|im_end|>") or TOK.eos_token_id

    if not req.stream:
        out = MODEL.generate(ids, max_new_tokens=req.max_tokens,
                             temperature=req.temperature, top_p=req.top_p,
                             eos_token_id=eos)
        new_tokens = out[0, ids.size(1):].tolist()
        text = TOK.decode(new_tokens, skip_special_tokens=True)
        return {"choices": [{"message": {"role": "assistant", "content": text},
                             "finish_reason": "stop"}],
                "usage": {"completion_tokens": len(new_tokens)}}

    def stream_gen():
        # token-by-token SSE so the frontend types out the answer live
        tokens = ids
        for _ in range(req.max_tokens):
            ctx = tokens[:, -MAX_CTX:]
            with torch.no_grad():
                logits, _ = MODEL(ctx)
                logits = logits[:, -1, :] / max(req.temperature, 1e-5)
                probs = torch.softmax(logits, dim=-1)
                nxt = torch.multinomial(probs, 1)
            tokens = torch.cat([tokens, nxt], dim=1)
            piece = TOK.decode(nxt[0].tolist(), skip_special_tokens=True)
            if piece:
                yield f"data: {json.dumps({'choices':[{'delta':{'content':piece}}]})}\n\n"
            if eos is not None and nxt.item() == eos:
                break
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream_gen(), media_type="text/event-stream")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--ckpt", required=True)
    p.add_argument("--config", default="config_2b.json")
    p.add_argument("--tokenizer", default="meta-llama/Llama-3.2-1B")
    p.add_argument("--port", type=int, default=8000)
    a = p.parse_args()

    TOK = AutoTokenizer.from_pretrained(a.tokenizer)
    ck = torch.load(a.ckpt, map_location="cpu")
    cfg = ModelConfig(**ck.get("config", {})) if "config" in ck \
        else ModelConfig.from_json(a.config)
    MAX_CTX = cfg.max_seq_len
    MODEL = ABaseLLM(cfg)
    MODEL.load_state_dict(ck["model"] if "model" in ck else ck)
    MODEL = MODEL.to(DEVICE).eval()
    if DEVICE == "cuda":
        MODEL = MODEL.to(torch.bfloat16)
    print(f"ABase-LLM loaded on {DEVICE}")
    uvicorn.run(app, host="0.0.0.0", port=a.port)
