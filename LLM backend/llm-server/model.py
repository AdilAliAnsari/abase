"""
ABase-LLM — 2.0B parameter decoder-only transformer, 4k context.
Architecture: LLaMA-style (RMSNorm, RoPE, SwiGLU, Grouped-Query Attention).

Config (config_2b.json):
    vocab_size   = 32000
    d_model      = 2048
    n_layers     = 30
    n_heads      = 16   (head_dim = 128)
    n_kv_heads   = 4    (GQA, 4x KV compression)
    d_ffn        = 8192 (SwiGLU hidden)
    max_seq_len  = 4096

Exact parameter count with this config: ~1,955,774,464  (~2.0B)
    embedding      : 32,000 x 2048              =    65,536,000
    per layer      : attn 10,485,760 + mlp 50,331,648 + norms 4,096
    30 layers      :                           = 1,824,645,120
    lm_head (untied):                          =    65,536,000
    final norm     :                           =         2,048
"""

import math
import json
import torch
import torch.nn as nn
import torch.nn.functional as F


# ---------------------------------------------------------------- config ---
class ModelConfig:
    def __init__(self, **kw):
        self.vocab_size = kw.get("vocab_size", 32000)
        self.d_model = kw.get("d_model", 2048)
        self.n_layers = kw.get("n_layers", 30)
        self.n_heads = kw.get("n_heads", 16)
        self.n_kv_heads = kw.get("n_kv_heads", 4)
        self.d_ffn = kw.get("d_ffn", 8192)
        self.max_seq_len = kw.get("max_seq_len", 4096)
        self.rope_theta = kw.get("rope_theta", 10000.0)
        self.norm_eps = kw.get("norm_eps", 1e-6)
        self.dropout = kw.get("dropout", 0.0)
        self.tie_embeddings = kw.get("tie_embeddings", False)

    @classmethod
    def from_json(cls, path):
        with open(path) as f:
            return cls(**json.load(f))

    @property
    def head_dim(self):
        return self.d_model // self.n_heads


# ------------------------------------------------------------- rmsnorm ---
class RMSNorm(nn.Module):
    def __init__(self, dim, eps):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x):
        dtype = x.dtype
        x = x.float()
        x = x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps)
        return (self.weight * x).to(dtype)


# ----------------------------------------------------------------- rope ---
class RotaryEmbedding(nn.Module):
    def __init__(self, head_dim, max_seq_len, theta):
        super().__init__()
        inv_freq = 1.0 / (theta ** (torch.arange(0, head_dim, 2).float() / head_dim))
        t = torch.arange(max_seq_len).float()
        freqs = torch.outer(t, inv_freq)                      # (T, head_dim/2)
        self.register_buffer("cos", freqs.cos(), persistent=False)
        self.register_buffer("sin", freqs.sin(), persistent=False)

    def forward(self, q, k):
        # q, k: (B, n_heads, T, head_dim)
        T = q.size(2)
        cos = self.cos[:T].unsqueeze(0).unsqueeze(0)          # (1,1,T,hd/2)
        sin = self.sin[:T].unsqueeze(0).unsqueeze(0)

        def rotate(x):
            x1, x2 = x.chunk(2, dim=-1)
            return torch.cat([x1 * cos - x2 * sin, x2 * cos + x1 * sin], dim=-1)

        return rotate(q), rotate(k)


# ------------------------------------------------------------ attention ---
class Attention(nn.Module):
    def __init__(self, cfg: ModelConfig):
        super().__init__()
        self.n_heads = cfg.n_heads
        self.n_kv_heads = cfg.n_kv_heads
        self.head_dim = cfg.head_dim
        self.n_rep = cfg.n_heads // cfg.n_kv_heads

        self.q_proj = nn.Linear(cfg.d_model, cfg.n_heads * self.head_dim, bias=False)
        self.k_proj = nn.Linear(cfg.d_model, cfg.n_kv_heads * self.head_dim, bias=False)
        self.v_proj = nn.Linear(cfg.d_model, cfg.n_kv_heads * self.head_dim, bias=False)
        self.o_proj = nn.Linear(cfg.n_heads * self.head_dim, cfg.d_model, bias=False)
        self.rope = RotaryEmbedding(self.head_dim, cfg.max_seq_len, cfg.rope_theta)

    def forward(self, x):
        B, T, _ = x.shape
        q = self.q_proj(x).view(B, T, self.n_heads, self.head_dim).transpose(1, 2)
        k = self.k_proj(x).view(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)
        v = self.v_proj(x).view(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)

        q, k = self.rope(q, k)

        # expand KV heads to match query heads (GQA)
        k = k.repeat_interleave(self.n_rep, dim=1)
        v = v.repeat_interleave(self.n_rep, dim=1)

        # flash attention (PyTorch >= 2.0) with causal mask
        out = F.scaled_dot_product_attention(q, k, v, is_causal=True)
        out = out.transpose(1, 2).contiguous().view(B, T, -1)
        return self.o_proj(out)


# ------------------------------------------------------------------ mlp ---
class MLP(nn.Module):
    def __init__(self, cfg: ModelConfig):
        super().__init__()
        self.gate_proj = nn.Linear(cfg.d_model, cfg.d_ffn, bias=False)
        self.up_proj = nn.Linear(cfg.d_model, cfg.d_ffn, bias=False)
        self.down_proj = nn.Linear(cfg.d_ffn, cfg.d_model, bias=False)

    def forward(self, x):
        return self.down_proj(F.silu(self.gate_proj(x)) * self.up_proj(x))


# ---------------------------------------------------------------- block ---
class Block(nn.Module):
    def __init__(self, cfg: ModelConfig):
        super().__init__()
        self.attn_norm = RMSNorm(cfg.d_model, cfg.norm_eps)
        self.attn = Attention(cfg)
        self.mlp_norm = RMSNorm(cfg.d_model, cfg.norm_eps)
        self.mlp = MLP(cfg)

    def forward(self, x):
        x = x + self.attn(self.attn_norm(x))
        x = x + self.mlp(self.mlp_norm(x))
        return x


# ---------------------------------------------------------------- model ---
class ABaseLLM(nn.Module):
    def __init__(self, cfg: ModelConfig):
        super().__init__()
        self.cfg = cfg
        self.embed = nn.Embedding(cfg.vocab_size, cfg.d_model)
        self.blocks = nn.ModuleList(Block(cfg) for _ in range(cfg.n_layers))
        self.norm = RMSNorm(cfg.d_model, cfg.norm_eps)
        self.lm_head = nn.Linear(cfg.d_model, cfg.vocab_size, bias=False)
        if cfg.tie_embeddings:
            self.lm_head.weight = self.embed.weight
        self.apply(self._init)

    def _init(self, m):
        if isinstance(m, nn.Linear):
            nn.init.normal_(m.weight, mean=0.0, std=0.02)
        elif isinstance(m, nn.Embedding):
            nn.init.normal_(m.weight, mean=0.0, std=0.02)

    def forward(self, tokens, targets=None):
        x = self.embed(tokens)
        for block in self.blocks:
            x = block(x)
        x = self.norm(x)
        logits = self.lm_head(x)
        loss = None
        if targets is not None:
            loss = F.cross_entropy(
                logits.view(-1, logits.size(-1)), targets.view(-1), ignore_index=-1
            )
        return logits, loss

    @torch.no_grad()
    def generate(self, tokens, max_new_tokens=512, temperature=0.8, top_p=0.9,
                 eos_token_id=None):
        """Autoregressive sampling with top-p (nucleus) filtering."""
        for _ in range(max_new_tokens):
            ctx = tokens[:, -self.cfg.max_seq_len:]
            logits, _ = self(ctx)
            logits = logits[:, -1, :] / max(temperature, 1e-5)
            if top_p < 1.0:
                sorted_logits, sorted_idx = torch.sort(logits, descending=True)
                cumprobs = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)
                remove = cumprobs > top_p
                remove[..., 1:] = remove[..., :-1].clone()
                remove[..., 0] = False
                logits.scatter_(1, sorted_idx, torch.where(
                    remove, torch.full_like(sorted_logits, float("-inf")), sorted_logits))
            probs = F.softmax(logits, dim=-1)
            next_tok = torch.multinomial(probs, num_samples=1)
            tokens = torch.cat([tokens, next_tok], dim=1)
            if eos_token_id is not None and (next_tok == eos_token_id).all():
                break
        return tokens


def count_parameters(model):
    total = sum(p.numel() for p in model.parameters())
    print(f"Parameters: {total:,}  (~{total/1e9:.2f}B)")
    return total


if __name__ == "__main__":
    cfg = ModelConfig.from_json("config_2b.json")
    model = ABaseLLM(cfg)
    count_parameters(model)
    x = torch.randint(0, cfg.vocab_size, (2, 128))
    logits, loss = model(x, targets=x)
    print("Forward OK:", logits.shape, "loss:", loss.item())
