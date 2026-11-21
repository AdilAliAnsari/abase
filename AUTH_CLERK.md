# Authentication: Clerk Integration & Google OAuth

This document covers user authentication, Google Sign-In with live avatar photo retrieval, account switching, and session management in Abase.

---

## 🔐 1. Authentication Architecture

Abase supports dual authentication pathways:
1. **Clerk Authentication Service**: Primary OAuth and passwordless provider supporting Google OAuth One-Tap and session cookies/tokens.
2. **Local JWT Authentication**: Secondary fallback mechanism for direct email/password accounts stored in MongoDB.

---

## 🌐 2. Clerk & Google OAuth Integration

### Client Implementation (`mobile/`):
- Handled by `clerkService.ts` and `AuthContext.tsx`.
- Initiates Google Sign-In via `WebBrowser.openAuthSessionAsync` on mobile or Clerk One-Tap redirect on Web.
- After Google authorization completes, Clerk generates a user session containing:
  - `user.id`: Unique Clerk identifier.
  - `user.primaryEmailAddress`: User email address.
  - `user.imageUrl`: High-resolution Google profile avatar photo.
  - `user.fullName` / `user.firstName`: Customer name.

### Live User Profile Avatar Rendering:
- **Header Avatar** ([Header.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/Header.tsx)):
  - If `user.avatar` or `user.imageUrl` exists, renders an `<Image source={{ uri }} />` circle.
  - If no photo is available, renders fallback initials (e.g. `AA` for Adil Ansari) over a high-contrast white circular badge with black text.
- **Side Drawer Card**:
  - Displays the active account avatar, full name, and verified email badge.

---

## 🔄 3. Account Quick-Switching

The sign-in interface ([LoginScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/LoginScreen.tsx)) incorporates an account switcher:
- Automatically preserves previously authenticated accounts in secure storage.
- Displays a **Saved Accounts** list with user avatars, email addresses, and last active indicators.
- Users can switch profiles with a single tap without re-entering credentials.
- Users can remove saved sessions or tap **"Use Another Account"** to sign in with a new identity.

---

## 🛡️ 4. Security & Account Protection

- **Password Changes** ([ChangePasswordScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/ChangePasswordScreen.tsx)):
  - Real-time password strength meter (Weak $\rightarrow$ Good $\rightarrow$ Strong & Secure).
  - Passwords salted and hashed with bcrypt on the backend.
- **Two-Factor Authentication (2FA)**:
  - Toggle switch in Account Security requiring email OTP code verification for logins from unrecognized devices.
- **Email Verification** ([VerifyEmailScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/VerifyEmailScreen.tsx)):
  - 6-digit OTP delivery via Nodemailer to verify student academic emails.
