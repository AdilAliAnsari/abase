"""
Tokenize a text corpus into uint16 .npy shards for pretraining.

    python tokenize_data.py --input corpus.txt --out shards/ \
        --tokenizer meta-llama/Llama-3.2-1B --shard_tokens 50000000

Any HF tokenizer with a ~32k vocab works (Llama-3.x, Qwen2.5, etc.).
"""

import argparse
import numpy as np
from transformers import AutoTokenizer

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True, help="raw text file (or .txt dir)")
    p.add_argument("--out", default="shards/")
    p.add_argument("--tokenizer", default="meta-llama/Llama-3.2-1B")
    p.add_argument("--shard_tokens", type=int, default=50_000_000)
    a = p.parse_args()

    import os
    os.makedirs(a.out, exist_ok=True)
    tok = AutoTokenizer.from_pretrained(a.tokenizer)

    files = ([os.path.join(a.input, f) for f in sorted(os.listdir(a.input))]
             if os.path.isdir(a.input) else [a.input])

    buf, shard_idx, total = [], 0, 0
    for path in files:
        print(f"tokenizing {path}")
        with open(path, encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                ids = tok.encode(line) + [tok.eos_token_id]
                buf.extend(ids)
                while len(buf) >= a.shard_tokens:
                    arr = np.array(buf[:a.shard_tokens], dtype=np.uint16)
                    np.save(os.path.join(a.out, f"shard_{shard_idx:05d}.npy"), arr)
                    total += len(arr)
                    buf = buf[a.shard_tokens:]
                    shard_idx += 1
                    print(f"  wrote shard_{shard_idx-1:05d}.npy ({total:,} tokens so far)")
    if buf:
        arr = np.array(buf, dtype=np.uint16)
        np.save(os.path.join(a.out, f"shard_{shard_idx:05d}.npy"), arr)
        total += len(arr)
    print(f"done: {total:,} tokens in {shard_idx+1} shards -> {a.out}")

if __name__ == "__main__":
    main()
