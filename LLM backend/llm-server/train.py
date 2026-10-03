"""
ABase-LLM training script — pretraining + SFT, DDP, bf16, cosine schedule.

PRETRAINING
  1. Tokenize your corpus into uint16 shards:
       python tokenize_data.py --input corpus.txt --out shards/  (see README)
  2. Multi-GPU:
       torchrun --nproc_per_node=8 train.py --mode pretrain \
           --data shards/ --batch 12 --grad_accum 4 --steps 30000

SFT (instruction/chat fine-tuning from a base checkpoint)
       torchrun --nproc_per_node=8 train.py --mode sft \
           --sft_file sft_data.jsonl --resume checkpoints/base.pt

Hardware guide for the 2B config:
  - Pretrain (needs ~40B tokens for decent quality): 8x A100-80G, ~2-3 weeks
  - Quick experiment (1-2B tokens): 8x A100, ~1 day
  - SFT only on a pretrained base: 1x A100-80G works (batch 2, grad_accum 16)

Cheaper alternative: fine-tune an existing open 1-2B base (Qwen3-1.7B,
Llama-3.2-1B, Gemma-3-1B) with --mode sft and skip pretraining entirely.
"""

import os
import json
import math
import time
import argparse
import numpy as np
import torch
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

from model import ABaseLLM, ModelConfig


# ------------------------------------------------------------ data -------
class TokenShardDataset(torch.utils.data.Dataset):
    """Pretraining: memmapped uint16 token shards -> fixed-length samples."""
    def __init__(self, shard_dir, seq_len):
        self.seq_len = seq_len
        self.arrays = []
        self.lengths = []
        for fn in sorted(os.listdir(shard_dir)):
            if fn.endswith(".npy"):
                a = np.load(os.path.join(shard_dir, fn), mmap_mode="r")
                self.arrays.append(a)
                self.lengths.append(len(a) - seq_len - 1)
        self.total = sum(self.lengths)
        if self.total <= 0:
            raise ValueError(f"No usable .npy shards in {shard_dir}")

    def __len__(self):
        return self.total

    def __getitem__(self, i):
        for a, n in zip(self.arrays, self.lengths):
            if i < n:
                chunk = a[i:i + self.seq_len + 1].astype(np.int64)
                return torch.from_numpy(chunk[:-1]), torch.from_numpy(chunk[1:])
            i -= n


class SFTDataset(torch.utils.data.Dataset):
    """
    SFT: JSONL lines {"messages":[{"role":"user","content":...}, ...]}.
    Loss is masked to assistant tokens only.
    """
    def __init__(self, path, tokenizer, seq_len):
        self.rows = [json.loads(l) for l in open(path)]
        self.tok = tokenizer
        self.seq_len = seq_len

    def __len__(self):
        return len(self.rows)

    def __getitem__(self, i):
        msgs = self.rows[i]["messages"]
        ids, labels = [], []
        ids += self.tok.encode("<|begin_of_text|>")
        labels += [-1]
        for m in msgs:
            hdr = self.tok.encode(f"<|im_start|>{m['role']}\n")
            body = self.tok.encode(m["content"] + "<|im_end|>\n")
            ids += hdr + body
            if m["role"] == "assistant":
                labels += [-1] * len(hdr) + body          # train on answer
            else:
                labels += [-1] * (len(hdr) + len(body))   # mask prompt
        ids = ids[: self.seq_len + 1]
        labels = labels[: self.seq_len + 1]
        pad = self.seq_len + 1 - len(ids)
        ids += [0] * pad
        labels += [-1] * pad
        x = torch.tensor(ids[:-1], dtype=torch.long)
        y = torch.tensor(labels[1:], dtype=torch.long)
        return x, y


# ------------------------------------------------------------ schedule ---
def lr_at(step, args):
    if step < args.warmup:
        return args.lr * (step + 1) / args.warmup
    p = (step - args.warmup) / max(1, args.steps - args.warmup)
    return args.min_lr + 0.5 * (args.lr - args.min_lr) * (1 + math.cos(math.pi * p))


# ---------------------------------------------------------------- main ---
def main():
    p = argparse.ArgumentParser()
    p.add_argument("--config", default="config_2b.json")
    p.add_argument("--mode", choices=["pretrain", "sft"], default="pretrain")
    p.add_argument("--data", default="shards/")
    p.add_argument("--sft_file", default="sft_data.jsonl")
    p.add_argument("--tokenizer", default="meta-llama/Llama-3.2-1B")  # any 32k-vocab HF tokenizer
    p.add_argument("--batch", type=int, default=8)          # per-GPU micro-batch
    p.add_argument("--grad_accum", type=int, default=8)
    p.add_argument("--steps", type=int, default=30000)
    p.add_argument("--lr", type=float, default=3e-4)
    p.add_argument("--min_lr", type=float, default=3e-5)
    p.add_argument("--warmup", type=int, default=2000)
    p.add_argument("--weight_decay", type=float, default=0.1)
    p.add_argument("--grad_clip", type=float, default=1.0)
    p.add_argument("--ckpt_dir", default="checkpoints")
    p.add_argument("--resume", default=None)
    p.add_argument("--log_every", type=int, default=10)
    p.add_argument("--save_every", type=int, default=1000)
    args = p.parse_args()

    # ---- DDP setup (single-GPU works too: just run without torchrun) ----
    ddp = "RANK" in os.environ
    if ddp:
        dist.init_process_group("nccl")
        rank, world = int(os.environ["RANK"]), int(os.environ["WORLD_SIZE"])
        local_rank = int(os.environ["LOCAL_RANK"])
        torch.cuda.set_device(local_rank)
        device = f"cuda:{local_rank}"
    else:
        rank, world, device = 0, 1, "cuda" if torch.cuda.is_available() else "cpu"
    master = rank == 0

    cfg = ModelConfig.from_json(args.config)
    torch.manual_seed(1337 + rank)

    model = ABaseLLM(cfg).to(device)
    if args.resume:
        sd = torch.load(args.resume, map_location="cpu")
        model.load_state_dict(sd["model"] if "model" in sd else sd)
        if master:
            print(f"Resumed from {args.resume}")
    if ddp:
        model = DDP(model, device_ids=[local_rank])

    # ---- data ----
    if args.mode == "pretrain":
        ds = TokenShardDataset(args.data, cfg.max_seq_len)
    else:
        from transformers import AutoTokenizer
        tok = AutoTokenizer.from_pretrained(args.tokenizer)
        ds = SFTDataset(args.sft_file, tok, cfg.max_seq_len)

    sampler = torch.utils.data.DistributedSampler(ds, shuffle=True) if ddp else None
    loader = torch.utils.data.DataLoader(
        ds, batch_size=args.batch, shuffle=(sampler is None),
        sampler=sampler, num_workers=4, pin_memory=True, drop_last=True)

    # ---- optimizer: no weight-decay on norms/embeddings ----
    decay, no_decay = [], []
    for n, prm in model.named_parameters():
        (decay if prm.dim() >= 2 else no_decay).append(prm)
    opt = torch.optim.AdamW(
        [{"params": decay, "weight_decay": args.weight_decay},
         {"params": no_decay, "weight_decay": 0.0}],
        lr=args.lr, betas=(0.9, 0.95), fused=torch.cuda.is_available())

    os.makedirs(args.ckpt_dir, exist_ok=True)
    raw = model.module if ddp else model
    it = iter(loader)
    t0 = time.time()

    for step in range(args.steps):
        lr = lr_at(step, args)
        for g in opt.param_groups:
            g["lr"] = lr

        loss_acc = 0.0
        for _ in range(args.grad_accum):
            try:
                x, y = next(it)
            except StopIteration:
                if sampler is not None:
                    sampler.set_epoch(step)
                it = iter(loader)
                x, y = next(it)
            x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
            with torch.autocast(device_type="cuda", dtype=torch.bfloat16,
                                enabled=device.startswith("cuda")):
                _, loss = model(x, targets=y)
                loss = loss / args.grad_accum
            loss.backward()
            loss_acc += loss.item()

        torch.nn.utils.clip_grad_norm_(model.parameters(), args.grad_clip)
        opt.step()
        opt.zero_grad(set_to_none=True)

        if master and (step % args.log_every == 0):
            dt = time.time() - t0
            toks = args.batch * args.grad_accum * world * cfg.max_seq_len
            print(f"step {step:6d} | loss {loss_acc:.4f} | lr {lr:.2e} | "
                  f"{toks/dt/1e6:.2f}M tok/s")
            t0 = time.time()

        if master and (step % args.save_every == 0 or step == args.steps - 1):
            path = os.path.join(args.ckpt_dir, f"ckpt_{step:06d}.pt")
            torch.save({"model": raw.state_dict(), "config": vars(cfg),
                        "step": step, "loss": loss_acc}, path)
            print(f"saved {path}")

    if ddp:
        dist.destroy_process_group()


if __name__ == "__main__":
    main()
