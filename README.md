# Abase — Universal AI-Powered Multi-Platform Ecosystem

Abase is a modern, modular ecosystem combining a high-performance **React Native / Expo Mobile Application**, a scalable **Express.js Backend**, a custom **PyTorch LLM Server & AI Pipeline**, and structured **GSD (Get Shit Done)** engineering workflows.

---

## 🏗️ Project Architecture

```
abase/
├── mobile/                   # React Native & Expo Mobile Application (iOS, Android, Web)
│   ├── src/
│   │   ├── components/       # Reusable UI (Header, BookCard, PDFCard, VideoCard, AmazonBuyNowModal, MXPlayerModal, etc.)
│   │   ├── screens/          # App Screens (Home, PDFLibrary, Video, Cart, Distributor, AiChat, Account, etc.)
│   │   ├── navigation/       # React Navigation (RootStack, TabNavigator)
│   │   ├── context/          # Context Providers (AuthContext, CartContext)
│   │   ├── services/         # API clients (api.ts, clerkService.ts)
│   │   ├── i18n/             # Multilingual localization (English, Hindi, Kannada)
│   │   ├── theme/            # Monochrome white design system, tokens, layout constants
│   │   └── utils/            # Utilities (pdfViewerUtils, formatters)
│   └── package.json
│
├── backend/                  # Core REST API Services (Express.js 5 + MongoDB / Mongoose)
│   ├── src/
│   │   ├── models/           # Mongoose schemas (User, PDF, Order, Notification)
│   │   ├── routes/           # REST endpoints (auth, pdfs, orders, razorpay, notifications)
│   │   ├── lib/              # Cloudinary, database, and payment configurations
│   │   └── index.js          # API server entrypoint
│   └── package.json
│
├── LLM backend/              # Custom Deep Learning & LLM Inference Service
│   ├── express/              # Express bridge with streaming AI routes
│   └── llm-server/           # Custom PyTorch 2B Transformer model, tokenizer, and server
│       ├── model.py          # PyTorch Transformer architecture
│       ├── server.py         # FastAPI/HTTP inference server
│       ├── train.py          # Distributed training pipeline
│       └── config_2b.json    # 2-billion parameter model configuration
│
├── DESIGN_SYSTEM.md          # Specification for Aurora Monochrome design system & button contrast
├── CHECKOUT_PAYMENTS.md      # Amazon 1-Click Buy Now, Cart, & Razorpay payment flow docs
├── AUTH_CLERK.md             # Clerk authentication, Google OAuth, & user profile docs
├── PDF_LIBRARY_NOTIFICATIONS.md # VTU PDF library uploads & real-time notification specs
├── VIDEO_PLAYER.md           # Embedded in-app video player system specifications
├── ACCESSIBILITY_TTS.md      # Blind Mode Text-to-Speech (TTS) accessibility specifications
├── PROJECT_RULES.md          # GSD development protocols and verification standards
└── deployment/               # Build, deployment, environment, and rollback specs
```

---

## 📱 Mobile App Key Features (`mobile/`)

### 1. Aurora Monochrome Design System
- **Unified Deep Midnight Canvas (`#06080C`)**: Consistent background across both Web and native Mobile (iOS/Android).
- **Soft Ambient Light Transforms**: Subtle monochrome white radial aurora glows drifting behind content (`components/ui/aurora.tsx` and `components/DarkGradientBg.tsx`).
- **Strict Inverted Button Contrast**:
  - **White Buttons** (`#FFFFFF`): Always use deep black text and icons (`#000000`).
  - **Dark / Charcoal Buttons**: Always use pure white text and icons (`#FFFFFF`).
- **Retro Starry Chat Exception**: The AI Chatbot screen ([AiChat.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/AiChat.tsx)) preserves its iconic retro pixel starry canvas.

### 2. Clerk Authentication & Google OAuth
- **Google Sign-In**: 1-click Google OAuth authentication via Clerk with real user avatar photo fetching and display in the Header.
- **Account Quick-Switching**: Auto-saves previously signed-in accounts for instant switching.
- **2FA & Password Management**: End-to-end encrypted password updates and two-factor verification toggles.

### 3. Amazon 1-Click Buy Now & Cart Checkout
- **Amazon 1-Click Modal**: Bottom-sheet purchase flow with delivery address picker, Prime free delivery badge, and payment method selection.
- **Payment Methods & Card Choosing**:
  - Integrated with **Razorpay UPI & Cards** and **Cash on Delivery (COD)**.
  - Smart Card Flow: First-time customers are shown the card entry form; returning customers with saved cards skip card entry and select their saved card directly.
- **Cart Screen**: Dynamic subtotal calculation, quantity stepper, promo code vouchers, and multi-item checkout.

### 4. VTU Engineering PDF Library
- Complete repository for VTU schemes (2022 / 2018), syllabus, solved model question papers, and lecture notes.
- **In-App PDF Viewer Modal**: Current page tracking, page jumping, bookmarking, and fullscreen toggle.
- **Google Drive Integration**: Direct Drive preview support with fallback to device in-app browser.

### 5. Video Lecture Streaming & Embedded Player (`MXPlayerModal`)
- Direct embedded in-app video playback using `expo-video` on mobile (Android/iOS) and HTML5 `<video>` on Web—no external app redirection.
- Custom MX Player HUD controls with 10s double-tap skip seek, variable playback speeds (0.5x – 2.0x), aspect ratio cycling (`FIT`/`FILL`/`STRETCH`), scrubber seeking, and screen lock.
- Optional toggle to switch between custom HUD and native system player controls.

### 6. Interactive Header & Drawer Navigation
- Dynamic search bar with live filtering.
- Side drawer navigation for:
  - **Statistics**: Student performance metrics, study time tracking, and analytics.
  - **My Cards**: Digital wallet and saved payment method management.
  - **Order History**: Real-time order status tracking with re-download capabilities.
  - **Faculty Inbox & Notifications**: Direct messaging with college professors and VTU academic circulars.
  - **Language Localization**: Switch between English, Hindi, and Kannada on the fly.

---

## 🧠 LLM Backend & AI Service (`LLM backend/`)

- **PyTorch 2B Parameter Model**: Custom causal transformer built with multi-head attention, rotary position embeddings (RoPE), RMSNorm, and SwiGLU activations.
- **Inference Server (`server.py`)**: High-throughput text generation API supporting temperature, top-k, and top-p nucleus sampling.
- **Express Bridge (`aiRoutes.js`)**: Connects the mobile client to the LLM backend with support for streaming conversations and query routing.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+
- **Python**: v3.10+ with PyTorch & CUDA support (for LLM backend)
- **Expo Go** or **Android/iOS Simulator**
- **MongoDB**: Local or MongoDB Atlas instance

### 2. Running the Mobile App
```bash
cd mobile
npm install
npx expo start
```
- Press `a` for **Android Emulator**.
- Press `i` for **iOS Simulator**.
- Press `w` for **Web**.
- Scan the terminal QR code using **Expo Go** on your physical device.

### 3. Running the Backend API
```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

### 4. Running the LLM Server
```bash
cd "LLM backend/llm-server"
pip install -r requirements.txt
python server.py
```

---

## 📚 Documentation Index

- [DESIGN_SYSTEM.md](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/DESIGN_SYSTEM.md) — Aurora Monochrome theme tokens, color palette, and button contrast rules.
- [CHECKOUT_PAYMENTS.md](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/CHECKOUT_PAYMENTS.md) — 1-Click Buy Now modal, Razorpay, card choosing, and cart architecture.
- [AUTH_CLERK.md](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/AUTH_CLERK.md) — Clerk authentication, Google sign-in, and avatar profile handling.
- [PDF_LIBRARY_NOTIFICATIONS.md](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/PDF_LIBRARY_NOTIFICATIONS.md) — PDF uploads, Cloudinary pipeline, and notification dispatching.
- [PROJECT_RULES.md](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/PROJECT_RULES.md) — GSD engineering protocol and verification requirements.
