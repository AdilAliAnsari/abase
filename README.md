# Abase — Universal AI-Powered Multi-Platform Ecosystem

Abase is a modern, modular ecosystem combining a high-performance **React Native / Expo Mobile App**, an **Express.js Backend**, a custom **PyTorch LLM Server & AI Pipeline**, and structured **GSD (Get Shit Done)** agent workflows.

---

## 🏗️ Project Architecture

```
abase/
├── mobile/                   # React Native & Expo Mobile Application
│   ├── src/
│   │   ├── components/       # UI Components (Header, PDFCard, VideoCard, MXPlayerModal, PDFViewerModal, etc.)
│   │   ├── screens/          # App Screens (Home, PDFLibrary, Video, AIChat, Account, History, etc.)
│   │   ├── navigation/       # React Navigation (RootStack, TabNavigator)
│   │   ├── data/             # Static & Mock datasets (PDFs, Videos, Products)
│   │   ├── theme/            # Design system, colors, glassmorphism tokens
│   │   └── utils/            # Utilities (PDF viewing, caching, formatting)
│   └── package.json
│
├── backend/                  # Core REST API Services (Express.js + SQLite)
│   ├── src/                  # Controllers, models, routes, middleware
│   ├── Dockerfile            # Container configuration
│   └── package.json
│
├── LLM backend/              # Custom Deep Learning & LLM Inference Service
│   ├── express/              # Express bridge with streaming AI routes
│   └── llm-server/           # Custom PyTorch 2B Transformer model, tokenizer, and server
│       ├── model.py          # PyTorch Transformer architecture
│       ├── server.py         # FastAPI/HTTP inference server
│       ├── train.py          # Distributed training pipeline
│       ├── tokenize_data.py  # Data preprocessing & BPE tokenization
│       └── config_2b.json    # 2-billion parameter model configuration
│
├── adapters/                 # AI Assistant Adapter Configurations (Gemini, Claude, GPT)
├── deployment/               # Build, deployment, environments, and rollback specs
└── .gsd/ / .agents/          # GSD Autonomous Agent workflows & skills
```

---

## 📱 Mobile App Features (`mobile/`)

- **Modern Glassmorphism UI**: Native-feeling dark mode design system with cyan/teal accent gradients.
- **Interactive Header & Side Drawer**: Complete drawer navigation supporting:
  - **Statistics**: Interactive metrics and charts.
  - **My Cards**: Payment card management and balance tracker.
  - **Purchase History**: Order tracking and receipt viewing.
  - **Messages & Inbox**: Real-time message list and notification center.
  - **Account & Security**: Account details, language localization selector, password reset, and email verification.
- **PDF Library & Reader**:
  - Grid & List view with category filtering, search, and sorting.
  - In-app PDF reader modal featuring **current page tracking**, **fullscreen mode**, **page jumping**, and **bookmarking**.
  - Fallback integration to open documents directly in device browser/external viewer.
- **Video Library & MX Player**:
  - Custom video player modal with **gesture-based brightness & volume controls**.
  - Playback speed selection (0.5x – 2.0x), quality selector, aspect ratio toggle, double-tap seek (10s), and lock screen mode.
- **Integrated AI Assistant Chat**: Real-time AI chat interface with streaming responses and rich formatting.

---

## 🧠 LLM Backend & AI Service (`LLM backend/`)

- **PyTorch 2B Parameter Model**: Custom causal transformer built with multi-head attention, rotary position embeddings (RoPE), RMSNorm, and SwiGLU activations.
- **Inference Server (`server.py`)**: High-throughput text generation API supporting temperature, top-k, and top-p nucleus sampling.
- **Express Bridge (`aiRoutes.js`)**: Seamlessly connects the mobile client to the LLM backend with support for streaming conversations and query routing.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+
- **Python**: v3.10+ with PyTorch & CUDA support (for LLM backend)
- **Expo Go** or **Android/iOS Simulator**

### 2. Running the Mobile App
```bash
cd mobile
npm install
npx expo start
```
Scan the QR code with the **Expo Go** app (Android/iOS) or press `a` for Android Emulator / `i` for iOS Simulator.

### 3. Running the Backend Service
```bash
cd backend
npm install
npm run dev
```

### 4. Running the LLM Server
```bash
cd "LLM backend/llm-server"
pip install -r requirements.txt
python server.py
```

---

## 🛠️ Development & Workflows

This repository follows the **GSD (Get Shit Done)** development methodology:
- Run `/map` to synchronize codebase architecture documentation.
- Run `/plan` before starting new feature phases.
- Run `/verify` to perform empirical validation before releases.

See [PROJECT_RULES.md](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/PROJECT_RULES.md) for full engineering guidelines.
