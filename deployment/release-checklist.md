# Pre-Release & Deployment Checklist

> **Scope**: Practical, verified operational checklist for releasing changes in `abase` (Backend & Mobile/Web).  
> **Source Verification**: Grounded in the audited state of the codebase.

---

## 1. Code & Build Validation

- [ ] **Backend Dependencies**: Run `cd backend && npm ci` to verify that `package-lock.json` is in sync and dependencies install cleanly.
- [ ] **Mobile Linting**: Run `cd mobile && npm run lint` to verify no ESLint rule violations.
- [ ] **Mobile Web Export**: Run `cd mobile && npx expo export --platform web` to verify the production bundle compiles without bundler errors.
- [ ] **Docker Build Test**: Run `docker build -t abase-backend:test -f backend/Dockerfile backend/` to ensure container builds cleanly without missing files.

---

## 2. Environment Configuration & Secrets

- [ ] **`MONGO_URI`**: Verify production MongoDB Atlas connection string is valid and database user credentials have read/write access.
- [ ] **MongoDB Network Access**: Verify target server IP address is whitelisted in MongoDB Atlas Security Settings.
- [ ] **`CLERK_SECRET_KEY` & `CLERK_PUBLISHABLE_KEY`**: Verify live production keys (starting with `sk_live_` and `pk_live_`) are configured rather than test keys (`sk_test_`, `pk_test_`).
- [ ] **`CLERK_APP_ID`**: Verify Clerk Application ID is set if environment-specific tracking is required.
- [ ] **`EMAIL_FROM` & `EMAIL_PASSWORD`**: Verify SMTP user email and a valid Google 16-character App Password are configured for Nodemailer OTP delivery.
- [ ] **Mobile Target URL**: Verify that the API URL in mobile ([`mobile/src/components/AiChat.tsx`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/AiChat.tsx#L41)) points to the public production backend domain instead of local IP `http://192.168.1.20:3000`.

---

## 3. Database & Migration Validation

- [ ] **Atlas Backup**: Take a manual snapshot or verify automated backup in MongoDB Atlas Console prior to deployment.
- [ ] **Schema Compatibility**: Review any schema modifications in [`backend/src/models/User.js`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/models/User.js) or [`backend/src/models/PDF.js`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/models/PDF.js) for backward compatibility with existing documents.
- [ ] **Index Verification**: Confirm required Mongoose indexes (e.g., text search indexes on title/description/tags) are created in Atlas.

---

## 4. API & Cross-Layer Compatibility

- [ ] **Route Availability**: Confirm backend registers all routes expected by client apps (`/api/auth`, `/api/books`, `/api/pdf`).
- [ ] **Authentication Middleware**: Test `@clerk/express` middleware against authenticated and unauthenticated requests.
- [ ] **CORS Settings**: Verify that frontend origin domains are allowed to access backend endpoints.

---

## 5. Deployment Execution

- [ ] **Deploy Backend**: Run `docker compose up --build -d backend` (or push image to production container runner).
- [ ] **Deploy Frontend Web**: Upload `mobile/dist/` artifacts to production web host / CDN.
- [ ] **Submit Native Binaries** *(if mobile update)*: Upload generated `.aab` / `.ipa` to Google Play Console / App Store Connect.

---

## 6. Post-Deployment Verification & Health Checks

- [ ] **Root Health Check**: Execute `curl -i http://<DEPLOYED_DOMAIN>:<PORT>/` and verify response `{"success":true,"message":"Server is running",...}` with HTTP 200.
- [ ] **Database Connection Check**: Run `docker compose logs backend` and verify `✅ Database connected: <host>` log entry.
- [ ] **Public Endpoint Test**: Execute `curl -i http://<DEPLOYED_DOMAIN>:<PORT>/api/books/` and verify valid JSON response.
- [ ] **Email Service Check**: Trigger a test registration or OTP code request (`POST /api/auth/register`) and verify email delivery in test inbox.

---

## 7. Smoke Testing

- [ ] **Mobile Web / App Launch**: Open app and verify Home screen loads without blank screen or fatal JavaScript exceptions.
- [ ] **Catalog Navigation**: Navigate between Home, Book Detail screen, and Tab bar items.
- [ ] **Auth Flow**: Test registration, login, and token generation flows.

---

## 8. Rollback Readiness Confirmation

- [ ] **Backup `.env`**: Confirm `backend/.env.backup` exists on host with previous known-working configuration.
- [ ] **Previous Git Commit ID**: Record last stable commit hash prior to deployment.
- [ ] **Rollback Procedure Understood**: Confirm operator is familiar with commands in [`deployment/rollback.md`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/deployment/rollback.md).
