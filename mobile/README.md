# Abase Mobile Application

A production-ready, cross-platform mobile application built with **React Native**, **Expo SDK 58**, and **TypeScript**, powered by an **Aurora Monochrome Dark Design System**, integrated PDF and video lecture viewers, Amazon 1-click checkout, and Clerk Google authentication.

---

## 🎨 Design System & UI Architecture

### 1. Aurora Monochrome Theme
- **Deep Midnight Canvas (`#06080C`)**: Unified across Web, iOS, and Android to guarantee 100% visual consistency across platforms.
- **Aurora Light Drift** ([aurora.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/ui/aurora.tsx)): Soft radial ambient monochrome white light beams drifting behind content via transforms on web and optimized linear gradients on native.
- **Pure White Accent Palette**:
  - Replaced all legacy green (`#69D900`, `#7BEA12`), orange (`#FF9900`, `#FFA41C`), and blue (`#00B7FF`, `#00D2FF`) elements with clean white (`#FFFFFF`) or translucent white (`rgba(255, 255, 255, 0.x)`).
- **Strict Inverted Button Contrast**:
  - **White Buttons** (`#FFFFFF` background): Black text & black icons (`#000000`).
  - **Dark / Charcoal Buttons**: White text & white icons (`#FFFFFF`).
- **Retro Starry Canvas Exception**: The AI Chatbot screen ([AiChat.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/AiChat.tsx)) preserves its retro pixel starry backdrop.

---

## 📱 Features & Core Modules

### 1. Authentication & Profile Management
- **Clerk Google Sign-In**: Integrated Clerk SDK supporting Google OAuth 1-click login and standard email credentials.
- **Live Google Avatar**: Automatically fetches and renders the user's authentic Google account profile image in the top Header and Account drawer, with initials fallback.
- **Account Quick-Switching**: Securely remembers recent accounts for one-tap switching.
- **Account Security**: End-to-end password updates ([ChangePasswordScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/ChangePasswordScreen.tsx)), email OTP verification ([VerifyEmailScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/VerifyEmailScreen.tsx)), and 2FA toggles.

### 2. Amazon 1-Click Buy Now & Cart Checkout
- **1-Click Buy Now Modal** ([AmazonBuyNowModal.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/AmazonBuyNowModal.tsx)):
  - Bottom sheet checkout with shipping address selection and Prime delivery guarantee.
  - Payment method choices: Razorpay UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Cash on Delivery (COD).
  - **Smart Card Selection**: First-time users are presented with the card entry form; returning users with saved cards skip the form and select from their saved cards.
- **Cart Screen** ([CartScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/CartScreen.tsx)):
  - Multi-item management with quantity controls.
  - Promo coupon redemption and order summary calculations.
  - Bottom sticky Proceed to Buy bar.

### 3. VTU Engineering PDF Library
- **PDF Library Screen** ([PDFLibraryScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/PDFLibraryScreen.tsx)):
  - Filter by VTU Schemes (2022 Scheme, 2018 Scheme), Semesters (1st – 8th), and Subjects (CSE, ISE, ECE, ME).
  - Search by document title, lecturer/author, and module number.
  - Grid & List view switcher.
- **In-App PDF Viewer Modal** ([PDFViewerModal.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/PDFViewerModal.tsx)):
  - Live page tracking (`Page X of Y`), jump to page, bookmarking, and fullscreen toggle.
  - Seamless Google Drive viewing and in-app browser fallback ([pdfViewerUtils.ts](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/utils/pdfViewerUtils.ts)).

### 4. Video Streaming & MX Player Experience
- **Video Library Screen** ([VideoScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/VideoScreen.tsx)):
  - Video lecture playlist with thumbnail previews, duration indicators, and topic chips.
- **MX Player Modal** ([MXPlayerModal.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/MXPlayerModal.tsx)):
  - Gestures for brightness (left screen drag) and volume control (right screen drag).
  - Multi-speed playback (0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x).
  - Resolution selector (Auto, 1080p, 720p, 480p, 360p), double-tap 10s skip seek, and UI lock mode.

### 5. Drawer & Student Services
- **Statistics** ([StatisticsScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/StatisticsScreen.tsx)): Attendance, study analytics, and performance charts.
- **My Cards** ([MyCardsScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/MyCardsScreen.tsx)): Digital payment cards wallet.
- **Order History** ([HistoryScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/HistoryScreen.tsx)): Order records with instant re-download capabilities.
- **Inbox & Notifications** ([InboxScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/InboxScreen.tsx), [NotificationsScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/NotificationsScreen.tsx)): Faculty direct messaging and exam alerts.
- **Distributor Portal** ([DistributorScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/DistributorScreen.tsx)): Upload and distribute study materials.
- **Language Switcher** ([LanguageScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/LanguageScreen.tsx)): Localization in English, Hindi, and Kannada.

---

## 📂 Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable components (Header, BookCard, PDFCard, VideoCard, Modals)
│   │   └── ui/           # Aurora background, border beams, utilities
│   ├── context/          # Global state (AuthContext, CartContext)
│   ├── data/             # Static & mock data (books, pdfs, videos)
│   ├── i18n/             # Multilingual localization context & translations
│   ├── navigation/       # AppNavigator (Stack & Tab navigation)
│   ├── screens/          # Screen implementations
│   ├── services/         # API clients (api.ts, clerkService.ts)
│   ├── theme/            # Theme tokens, colors.ts
│   └── utils/            # Helper utilities (pdfViewerUtils.ts)
├── app.json              # Expo configuration
├── package.json
└── tsconfig.json
```

---

## 🚀 Running Locally

1. **Install dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Start the Expo development server**:
   ```bash
   npx expo start
   ```

3. **Run on Target**:
   - Press `a` for **Android Emulator**.
   - Press `i` for **iOS Simulator**.
   - Press `w` for **Web**.
   - Scan the terminal QR code with **Expo Go** on your physical mobile device.
