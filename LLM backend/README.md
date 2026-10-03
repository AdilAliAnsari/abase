# LLM Backend & AI Inference Engine

A modular deep learning pipeline and HTTP inference server for custom causal language models, featuring a 2-billion parameter Transformer architecture in PyTorch, tokenization scripts, training loops, and an Express.js route bridge.

---

## 🏗️ Architecture Overview

```
LLM backend/
├── express/
│   └── src/
│       └── routes/
│           └── aiRoutes.js       # Express route handlers bridging Mobile App to LLM Server
│
└── llm-server/
    ├── config_2b.json            # 2B Transformer hyperparameter configuration
    ├── model.py                  # PyTorch Causal Transformer implementation
    ├── requirements.txt          # Python dependencies
    ├── server.py                 # FastAPI / HTTP inference server
    ├── tokenize_data.py          # Data ingestion, formatting, and BPE tokenization
    └── train.py                  # PyTorch training pipeline with mixed-precision support
```

---

## ⚙️ Model Architecture (`llm-server/model.py`)

- **Causal Decoder Transformer** designed for high-efficiency generative text processing.
- **Rotary Positional Embeddings (RoPE)** for superior context-length generalization.
- **RMSNorm** pre-normalization for numerical stability during distributed training.
- **SwiGLU** activation functions in Feed-Forward Networks (FFN).
- **KV Caching** during inference for low-latency generation.

---

## 🚀 Setup & Execution

### 1. Python Environment Setup
```bash
cd "LLM backend/llm-server"
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Tokenizing Training Data
```bash
python tokenize_data.py --input_file data/dataset.jsonl --output_dir data/tokenized/
```

### 3. Training the Model
```bash
python train.py --config config_2b.json --data_dir data/tokenized/ --output_dir checkpoints/
```

### 4. Running the Inference Server
```bash
python server.py --model_path checkpoints/latest --port 8000
```

---

## 🔌 API Integration

The Express bridge in `express/src/routes/aiRoutes.js` exposes standard REST endpoints for streaming and non-streaming inference:

- `POST /api/ai/chat` — Generate response with conversational context.
- `POST /api/ai/complete` — Fast text completion endpoint.
