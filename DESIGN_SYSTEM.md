# Design System: Aurora Monochrome & Inverted Contrast

This document defines the canonical visual specifications and implementation rules for the Abase application across **Web**, **Android**, and **iOS**.

---

## 🌌 1. Aurora Ambient Background

The background is a unified, immersive dark canvas with gentle drifting monochrome ambient lights.

### Base Canvas
- **Color**: `#06080C` (Deep Charcoal Midnight)
- Applied consistently across both Web and native Mobile (iOS and Android).

### Aurora Light Beams
- **Implementation**:
  - Web: Three drifting radial gradients driven by CSS transform animations (`components/ui/aurora.tsx`).
  - Native (iOS / Android): Three soft `LinearGradient` passes oriented from top-left, top-right, and bottom-center, fading into `rgba(6, 8, 12, 0)`.
- **Light Color Stops**:
  - Light 1: `rgba(255, 255, 255, 0.75)`
  - Light 2: `rgba(255, 255, 255, 0.45)`
  - Light 3: `rgba(255, 255, 255, 0.25)`
- **Native Android Safety**:
  - The gradient termination stop MUST ALWAYS use `'rgba(6, 8, 12, 0)'` rather than the keyword `"transparent"` or CSS `var(...)` strings to prevent Android `LinearGradientView` runtime exceptions.

### AI Chatbot Exception
- The AI Chat screen ([AiChat.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/AiChat.tsx)) is explicitly exempted from the Aurora background.
- It preserves the iconic **retro pixel starry backdrop** (`#000000` with twinkling pixel stars).

---

## ⚪ 2. Monochrome Color Palette

All legacy green (`#69D900`, `#7BEA12`), orange (`#FF9900`, `#FFA41C`), and blue (`#00B7FF`, `#00D2FF`) accent colors have been migrated to monochrome white and translucent white tiers:

| Element Type | Primary Token | Hex / Value | Description |
|--------------|---------------|-------------|-------------|
| Primary Text | `colors.primaryText` | `#FFFFFF` | Headings, active tabs, main labels |
| Secondary Text | `colors.secondaryText` | `#B8B8C2` | Body descriptions, subtitles |
| Muted Text | `colors.mutedText` | `#8D8D94` | Timestamps, metadata, hints |
| Primary Accent | `colors.accentGreen` | `#FFFFFF` | Highlights, active indicators |
| Accent Borders | `colors.border` | `rgba(255, 255, 255, 0.12)` | Subtle container boundaries |
| Active Borders | `colors.borderLight` | `rgba(255, 255, 255, 0.35)` | Focused inputs, selected cards |
| Glass Layers | `colors.glass` | `rgba(255, 255, 255, 0.05)` | Semi-transparent card backdrops |

---

## 🔘 3. Strict Button Contrast & Inversion Rules

High readability and crisp visual hierarchy are maintained through strict contrast inversion:

### White Buttons (Primary Actions)
Examples: *Add to Cart*, *Proceed to Buy*, *Place Order*, *Sign In / Up*, *Verify OTP*, *Update Password*, *Apply Filters*, active filter chips.
- **Background**: `#FFFFFF` (Solid White)
- **Text Color**: `#000000` (Deep Black, `fontWeight: '700'` or `'800'`)
- **Nested Icons**: `#000000` (Deep Black)
- **Active / Pressed**: `#EBEBEB`

### Dark Buttons (Secondary / Control Actions)
Examples: *Cancel*, *Clear Filters*, *Share*, *Re-download*, back buttons, header icons.
- **Background**: `rgba(27, 27, 41, 0.85)` or `#161922` (Dark Charcoal / Slate)
- **Text Color**: `#FFFFFF` (Pure White)
- **Border**: `1px solid rgba(255, 255, 255, 0.12)`
- **Nested Icons**: `#FFFFFF` (Pure White)

---

## 🧩 4. Component Implementation Guide

### Using `DarkGradientBg`
Wrap any new screen with `DarkGradientBg` to automatically provide the Aurora background:
```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import DarkGradientBg from '../components/DarkGradientBg';

export const MyNewScreen = () => {
  return (
    <DarkGradientBg>
      <View style={styles.container}>
        {/* Screen content */}
      </View>
    </DarkGradientBg>
  );
};
```
