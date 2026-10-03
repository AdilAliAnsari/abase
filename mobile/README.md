# Abase Mobile Application

A cross-platform mobile application built with **React Native**, **Expo**, and **TypeScript**, featuring a glassmorphism dark-mode design system, integrated PDF reader, advanced video player, and AI assistant chat.

---

## 📱 Features

### 1. Modern Glassmorphic Dark UI
- Deep navy background (`#0B0E14`) with glass card layers and glowing cyan accents (`#06B6D4` / `#00E5FF`).
- Smooth animations and fluid touch feedback across all components.

### 2. PDF Library & Reader
- **PDF Library Screen** ([PDFLibraryScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/PDFLibraryScreen.tsx)):
  - Category tags (All, AI & ML, Tech, Whitepapers, Research).
  - Search by title, author, and description.
  - Sorting by title, date, size, and page count.
  - Switch between Grid and List view layouts.
- **In-App PDF Viewer Modal** ([PDFViewerModal.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/PDFViewerModal.tsx)):
  - Page tracking with exact current page and total page counter (`Page X of Y`).
  - Page navigation controls (`Prev`, `Next`, `Jump to Page`).
  - Fullscreen toggle, bookmarking, and native sharing.
  - Fallback support via [pdfViewerUtils.ts](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/utils/pdfViewerUtils.ts) to open directly in the system web browser or default PDF reader.

### 3. Video Streaming & MX Player Experience
- **Video Library Screen** ([VideoScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/VideoScreen.tsx)):
  - Dynamic thumbnail previews, duration overlays, views count, and genre filters.
- **MX Player Modal** ([MXPlayerModal.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/MXPlayerModal.tsx)):
  - Gestures for screen brightness (left side drag) and volume control (right side drag).
  - Multi-speed playback (0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x).
  - Quality selector (Auto, 1080p, 720p, 480p, 360p).
  - Double-tap left/right 10-second skip seek.
  - Screen orientation toggle (Landscape / Portrait) and UI lock mode.

### 4. AI Assistant Chat
- Real-time AI chat screen ([AiChat.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/AiChat.tsx)) with conversational suggestions and streaming responses.

### 5. Drawer & Profile Management
Accessible from the global top [Header](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/Header.tsx):
- **Statistics** ([StatisticsScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/StatisticsScreen.tsx)): Interactive analytics and charts.
- **My Cards** ([MyCardsScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/MyCardsScreen.tsx)): Digital payment card management.
- **Purchase History** ([HistoryScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/HistoryScreen.tsx)): Transaction list with status badges.
- **Inbox & Notifications** ([InboxScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/InboxScreen.tsx), [NotificationsScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/NotificationsScreen.tsx)): Activity feeds and direct messages.
- **Account & Security** ([AccountDataScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/AccountDataScreen.tsx), [LanguageScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/LanguageScreen.tsx), [ChangePasswordScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/ChangePasswordScreen.tsx), [VerifyEmailScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/VerifyEmailScreen.tsx)).

---

## 📂 Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable UI widgets (Header, PDFCard, VideoCard, Modals)
│   ├── data/             # Mock datasets (pdfs.ts, videos.ts, products.ts)
│   ├── navigation/       # AppNavigator.tsx (Root Stack & Bottom Tabs)
│   ├── screens/          # Application screen components
│   ├── theme/            # Theme tokens, colors, layout constants
│   └── utils/            # Helper utilities (pdfViewerUtils.ts)
├── App.tsx               # Root entrypoint
├── package.json
└── tsconfig.json
```

---

## 🚀 Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the Expo development server**:
   ```bash
   npx expo start
   ```

3. **Run on a device or emulator**:
   - Press `a` in the terminal to launch on **Android Emulator**.
   - Press `i` in the terminal to launch on **iOS Simulator**.
   - Scan the terminal QR code with **Expo Go** on your physical device.
