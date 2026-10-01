# Environments & Configuration Guide

> **Scope**: Verified configuration and environment definitions for the `abase` monorepo (Backend & Mobile / Web).  
> **Source Verification**: Grounded strictly in existing codebase files ([`backend/.env`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/.env), [`backend/Dockerfile`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/Dockerfile), [`backend/src/index.js`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/index.js), [`mobile/.env`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/.env), [`docker-compose.yml`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/docker-compose.yml)).

---

## 1. Environment Architecture

| Environment | Backend Runtime | Frontend Runtime | Database / Services | Verification Status |
|---|---|---|---|---|
| **Development** | Node.js via `nodemon` on host (`PORT=3000`) | Expo Metro Bundler (Web / iOS / Android) | External MongoDB Atlas Cluster + Clerk Dev Instance | **VERIFIED** |
| **Containerized Dev/Local Prod** | Docker container (`node:22-alpine`) via `docker-compose.yml` | Web export or Expo client | External MongoDB Atlas Cluster + Clerk Dev Instance | **VERIFIED** |
| **Staging** | *No separate staging config or deployment target defined* | *No separate staging config defined* | *Not configured* | **UNKNOWN / NEEDS CONFIRMATION** |
| **Production** | Container target (`node:22-alpine` in `backend/Dockerfile`) | Web static bundle (`npx expo export`) / Native standalone builds | External MongoDB Atlas Cluster + Clerk Prod Instance | **PARTIALLY VERIFIED** (Host infrastructure & DNS unconfigured) |

---

## 2. Environment Variables Specification

### 2.1 Backend Environment Variables

The backend loads variables from [`backend/.env`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/.env) via `dotenv.config()` in [`backend/src/index.js`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/index.js).

| Variable Name | Required | Sensitive | Default (Fallback) | Code Usage / Purpose | Verified Source |
|---|---|---|---|---|---|
| `PORT` | Optional | No | `3000` | HTTP listening port for Express application | [`backend/src/index.js:15`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/index.js#L15) |
| `MONGO_URI` | **Required** | **Yes** | *None* (Fatal error on start) | MongoDB Atlas connection string URI with user credentials | [`backend/src/lib/db.js:5`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/lib/db.js#L5) |
| `CLERK_PUBLISHABLE_KEY` | **Required** | No | *None* | Clerk client-side authentication key used by `@clerk/express` | [`backend/.env:5`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/.env#L5) |
| `CLERK_SECRET_KEY` | **Required** | **Yes** | *None* | Clerk backend secret key used by `@clerk/express` middleware | [`backend/.env:6`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/.env#L6) |
| `CLERK_APP_ID` | Optional | No | `"not set"` | Clerk Application ID referenced in health check root endpoint `GET /` and startup logs | [`backend/src/index.js:33`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/index.js#L33) |
| `EMAIL_FROM` | **Required** (for OTP) | No | *None* | Sender email address for nodemailer verification & password reset emails | [`backend/src/utils/emailServices.js:7`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/utils/emailServices.js#L7) |
| `EMAIL_PASSWORD` | **Required** (for OTP) | **Yes** | *None* | Gmail App Password or SMTP credentials for nodemailer transport | [`backend/src/utils/emailServices.js:8`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/utils/emailServices.js#L8) |
| `NODE_ENV` | Optional | No | *None* (Set to `production` in Dockerfile) | Node runtime environment flag | [`backend/Dockerfile:11`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/Dockerfile#L11) |

### 2.2 Mobile Environment Variables

| Variable Name | Required | Sensitive | Default (Fallback) | Code Usage / Purpose | Verified Source |
|---|---|---|---|---|---|
| `EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK` | Optional | No | `1` | Disables Expo Router navigation check warning when using standard React Navigation | [`mobile/.env:1`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/.env#L1) |
| `EXPO_PUBLIC_API_URL` | *Recommended* | No | *Not implemented in code* | **UNKNOWN / NEEDS CONFIRMATION**: Currently [`mobile/src/components/AiChat.tsx`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/AiChat.tsx#L41) hardcodes `http://192.168.1.20:3000`. Environment-based API URL resolution is not yet implemented. |

---

## 3. Configuration Differences Across Environments

| Feature / Setting | Development | Docker Compose Local | Production (Target) |
|---|---|---|---|
| **Process Manager** | `nodemon` (auto-restart on file save) | `node` inside container (`restart: unless-stopped`) | Container orchestrator / Process runner (`node src/index.js`) |
| **Dependencies** | Full `devDependencies` (`nodemon`) | Production only (`npm ci --omit=dev`) | Production only (`npm ci --omit=dev`) |
| **CORS Policy** | `app.use(cors())` (All origins permitted) | `app.use(cors())` (All origins permitted) | `app.use(cors())` (All origins permitted - *No whitelist configured*) |
| **Error Handling** | Full stack trace logged to console | Full stack trace logged to console | Full stack trace logged to console (*No structured JSON/Sentry logging configured*) |
| **Mobile API Target** | Hardcoded LAN IP (`192.168.1.20:3000` in `AiChat.tsx`) | Hardcoded LAN IP | Requires public DNS / HTTPS URL (*Requires code adjustment or runtime config injection*) |

---

## 4. Secrets Handling & Security Audit

### Verified Findings:
1. **Repository Ignore Rules**:
   - Root [`.gitignore`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/.gitignore) ignores `.env`, `backend/.env`, and `mobile/.env`.
   - Backend [`.dockerignore`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/.dockerignore) explicitly ignores `.env` from Docker build context.
2. **Local Environment State**:
   - `backend/.env` is present locally with active credentials (MongoDB connection string, Clerk test keys).
   - In production deployment, secrets must be passed via secure container environment variables or CI/CD secret managers, NOT baked into Docker image layers.
3. **Database Credentials**:
   - The MongoDB Atlas connection string contains embedded database credentials.

---

## 5. Required External Services & Dependencies

1. **MongoDB Atlas Database**:
   - External MongoDB instance required.
   - Network connectivity to MongoDB Atlas (Port 27017 or SRV DNS resolution) must be allowed by hosting firewall/VPC.
2. **Clerk Authentication Service**:
   - Requires valid Clerk Secret Key and Publishable Key.
   - Used in Express middleware (`clerkMiddleware`) to validate JWT session tokens from incoming requests.
3. **SMTP / Email Gateway**:
   - Nodemailer is configured to use Gmail SMTP (`service: "gmail"`).
   - Requires a valid Google App Password (not standard account password) for sending verification OTPs.
4. **Cloudinary (Declared Dependency)**:
   - Present in [`backend/package.json`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/package.json#L16), but no initialization or API secret configuration is currently present in backend source code.

---

## 6. Verified vs Unknown Summary

- **VERIFIED**:
  - Exact backend environment variables (`PORT`, `MONGO_URI`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_APP_ID`, `EMAIL_FROM`, `EMAIL_PASSWORD`).
  - Docker Compose environment file injection mechanism (`./backend/.env`).
  - MongoDB connection string parsing and error behavior (`process.exit(1)` on connection failure).
- **UNKNOWN / NEEDS CONFIRMATION**:
  - Staging environment definition and URLs.
  - Production host domain name / HTTPS endpoints.
  - Strategy for parameterizing frontend mobile API endpoint across dev/staging/prod.
