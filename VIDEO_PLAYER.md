# Embedded In-App Video Player System (`MXPlayerModal`)

## Overview
Abase includes an embedded, in-app video player system designed to provide seamless educational lecture streaming directly inside the app on Android, iOS, and Web without launching external video players, third-party apps, or browser tabs.

---

## 🎬 Architecture & Player Implementation

### Cross-Platform Architecture
1. **Native Mobile (`Android` & `iOS`)**:
   - Powered by `expo-video` (`VideoView` & `useVideoPlayer`).
   - High-performance native hardware decoding via Android ExoPlayer / iOS AVPlayer.
   - Embedded directly in the modal canvas: No intents, no `openBrowserAsync`, and no redirection to external apps (such as MX Player external app, VLC, or browser).
2. **Web (`Desktop` & `Mobile Web`)**:
   - Powered by HTML5 `<video>` element with seamless DOM controls and event listeners.
3. **Clean Platform Split**:
   - `src/components/video/types.ts`: Universal player contracts (`PlayerHandle`, `VideoRendererProps`).
   - `src/components/video/VideoRenderer.native.tsx`: Native `expo-video` implementation.
   - `src/components/video/VideoRenderer.web.tsx`: HTML5 video renderer.
   - `src/components/video/VideoRenderer.tsx`: Entrypoint for TypeScript compilation and platform resolution.
4. **Three-Tier Touch & Pointer Layering**:
   - **Layer 0 (Video Surface)**: Set to `pointerEvents="none"` in HUD mode so the underlying media never intercepts or swallows UI taps.
   - **Layer 1 (Touch Responder)**: Full-screen gesture receiver handling single-tap to reveal controls and double-tap to seek ±10s.
   - **Layer 2 (Control Bars)**: Top bar, center playback buttons, and bottom scrubber bar have explicit `pointerEvents="auto"`, guaranteeing all button clicks and sliders fire instantaneously while the video is playing.

---

## ⚡ Features & Controls

| Feature | Gesture / Control | Behavior |
| :--- | :--- | :--- |
| **Play / Pause** | Center button or center single tap | Toggles playback smoothly |
| **Seek -10s** | Double-tap left 40% of screen | Fast rewinds 10 seconds with ripple effect |
| **Seek +10s** | Double-tap right 40% of screen | Fast forwards 10 seconds with ripple effect |
| **Scrubber Bar** | Tap or drag progress slider | Real-time position seeking with formatted timestamps |
| **Speed Control** | Top-right pill button | Choose from `0.5x`, `0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x` |
| **Quality Selector** | Top-right pill button | Quick indicator (`1080p FHD`, `720p HD`, etc.) |
| **Screen Lock** | Left floating lock button | Locks HUD touch area so accidental touches do not pause or alter playback |
| **Aspect Ratio** | Bottom-right aspect button | Cycles through `FIT` (contain), `FILL` (cover), and `STRETCH` (fill) |
| **Audio Mute** | Bottom-left volume button | Instantly mutes or unmutes lecture audio |
| **Native Controls Toggle** | Top-right `Native` pill | Switches to native system controls if preferred, or returns to MX Player HUD |
| **Download** | Top-right download icon | Triggers video file download for offline viewing |
| **Lecture Details** | Top header bar | Displays Course Code, Video Title, Faculty Name, and Scheme |

---

## 🛡️ Contrast & Accessibility
- **Monochrome Theme Compliance**: Strict black `#000000` canvas with white `#FFFFFF` text and contrast icons.
- **Blind Mode Recitation**: Video cards recite complete course metadata on single tap, and launch direct in-app playback on double tap.
