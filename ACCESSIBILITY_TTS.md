# Accessibility Ecosystem: Text-to-Speech (Blind Mode)

This document describes the **Text-to-Speech (TTS) Voice Assistance Ecosystem** implemented for visually impaired and blind users across **Android**, **iOS**, and **Web**.

---

## 🎙️ 1. Overview & Core Philosophy

The Text-to-Speech ecosystem follows standard accessible screen-reader patterns (similar to Apple VoiceOver and Android TalkBack):

- **When Blind Mode is ON**:
  1. **Single Tap / First Touch**: Selects the target item and recites all its text, metadata, authors, ratings, and pricing out loud. Visually highlights the card with a high-contrast white border.
  2. **Double Tap / Second Touch**: When an item is selected, a second tap (within a 4-second selection window) activates or opens the target (e.g., opens Product Details, opens the native PDF viewer modal, starts video playback, or triggers Add to Cart).
  3. **Auto-Page Announce**: When navigating to new screens (such as Product Details or the PDF viewer), the ecosystem announces the page title and core information immediately.

- **When Blind Mode is OFF**:
  - The application operates in **100% normal touch mode**. Single taps immediately navigate or trigger actions with zero latency or recitation.

---

## 🎛️ 2. Sidebar Control & Activation

The Blind Mode toggle is permanently accessible from the application sidebar (hamburger drawer):

- **Location**: In [Header.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/Header.tsx) under the **Accessibility & Voice Assist** section in both Web and Native drawer menus.
- **Controls**:
  - Icon: Volume / Speaker (`Volume2`)
  - Label: `Text-to-Speech (Blind Mode)`
  - Status Indicator: `[ON]` (solid white badge) or `[OFF]`
- **Voice Confirmation**:
  - Toggling **ON** speaks: *"Text-to-speech voice assistance for the blind is now enabled. Tap any card or button once to hear all details recited. Double click or tap again to open."*
  - Toggling **OFF** speaks: *"Text-to-speech voice assistance is now turned off. Returning to normal single-tap navigation."*
- **Persistence**: Preferences are stored in `AsyncStorage` (`@abase_blind_tts_enabled`), persisting across app restarts.

---

## 🔊 3. On-Screen Floating Indicator (`AccessibilityFloatingBar`)

When Blind Mode is enabled, an accessible floating bar appears at the bottom of the screen:
- **Visual Feedback**: Displays `Voice Assist (Blind Mode) Active`.
- **Live Status**: Shows when speech is active (`Speaking...`).
- **Mute Button**: One-tap instant mute (`VolumeX`) to halt current recitation.
- **Turn Off Button**: Immediate 1-tap exit to return to normal mode without having to open the sidebar drawer.

---

## 📖 4. Recitation Formats

### 1. Product Cards ([BookCard.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/BookCard.tsx))
- **Recited Information**:
  > *"Book title: {Title}. By author: {Author}. Price: ₹{Price}, original price ₹{OriginalPrice}, discount {Discount}% off. Rating: {Rating} stars with {Reviews} reviews. Category: {Category}. Badge: {Badge}. Prime fast delivery available. Double click to open."*
- **Add to Cart Action**:
  > *"Add {Title} to cart button. Double click to open."*

### 2. PDF Study Cards ([PDFCard.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/PDFCard.tsx))
- **Recited Information**:
  > *"PDF Study Document: {Title}. Course code: {SubjectCode}, Scheme: {Scheme}, Branch: {Branch}, Semester: {Semester}. Author: {Author}. File size: {FileSize}, Page count: {PageCount} pages. Rating: {Rating} stars. {Description}. Double click to open."*
- **Actions**:
  - View PDF button: Launches device PDF reader app chooser on double tap.
  - Download button: Downloads PDF file directly on double tap.

### 3. Video Lecture Cards ([VideoCard.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/VideoCard.tsx))
- **Recited Information**:
  > *"Video Lecture: {Title}. Course code: {SubjectCode}, Scheme: {Scheme}, Branch: {Branch}, Semester: {Semester}. Instructor: {InstructorName}. Duration: {Duration}, Quality: {Quality}. File size: {FileSize}. Rating: {Rating} stars. {Description}. Double click to open."*
- **Actions**:
  - Play button: Launches in-app video player on double tap.
  - Download button: Downloads video file directly on double tap.

---

## 🛠️ 5. Implementation Files

| File | Purpose |
| :--- | :--- |
| [AccessibilityContext.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/context/AccessibilityContext.tsx) | Core TTS engine, speech synthesis wrapper, state manager, double-tap detector |
| [AccessibilityFloatingBar.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/AccessibilityFloatingBar.tsx) | Floating status HUD with mute and disable actions |
| [Header.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/Header.tsx) | Sidebar drawer toggle button with live ON/OFF badges |
| [BookCard.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/BookCard.tsx) | Product card accessible touch and recitation |
| [PDFCard.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/PDFCard.tsx) | PDF card accessible touch and recitation |
| [VideoCard.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/VideoCard.tsx) | Video card accessible touch and recitation |
| [App.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/App.tsx) | Global Provider tree mounting and Floating HUD host |
