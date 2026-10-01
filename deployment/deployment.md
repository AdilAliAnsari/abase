# Deployment Guide & Architecture

> **Scope**: Verified deployment architecture, step-by-step rollout procedures, service topology, health checks, and project-specific failure modes for `abase`.  
> **Source Verification**: Grounded in [`docker-compose.yml`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/docker-compose.yml), [`backend/Dockerfile`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/Dockerfile), [`backend/src/index.js`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/index.js), [`mobile/src/components/AiChat.tsx`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/AiChat.tsx), and [`backend/src/lib/db.js`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/lib/db.js).

---

## 1. Actual Deployment Architecture

```
                                  ┌───────────────────────────┐
                                  │      Client Layer         │
                                  │   (Mobile App / Web UI)   │
                                  └─────────────┬─────────────┘
                                                │ HTTP / REST
                                                ▼
                                  ┌───────────────────────────┐
                                  │    Container / Reverse    │
                                  │           Proxy           │
                                  │     (Port 3000 -> 3000)   │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │   Express Backend Node 22 │
                                  │      (abase-backend)      │
                                  └──────┬────────────┬───────┘
                                         │            │
                  MongoDB Wire (Mongoose)│            │ Clerk JWT / HTTP
                                         ▼            ▼
                   ┌───────────────────────────┐  ┌───────────────────────────┐
                   │   MongoDB Atlas Cluster   │  │    Clerk Auth Service     │
                   │ (ebookstore_db / Cloud)   │  │   (API / Token Verify)    │
                   └───────────────────────────┘  └───────────────────────────┘
                                         │
                                         ▼ SMTP
                   ┌───────────────────────────┐
                   │    Gmail SMTP Gateway     │
                   │ (Email OTP & Pass Reset)  │
                   └───────────────────────────┘
```

---

## 2. Deployment Prerequisites

Before deploying the stack to any environment:
1. **Docker & Docker Compose**: Installed on target host with daemon running.
2. **MongoDB Atlas Network Whitelist**: Target server IP address or `0.0.0.0/0` (with strong password) whitelisted in MongoDB Atlas Network Access.
3. **Clerk Instance**: Active Clerk application with publishable and secret API keys.
4. **SMTP Credentials**: Configured Gmail account with a valid 16-character Google App Password.
5. **DNS / Reverse Proxy**: Domain and SSL/TLS termination (Nginx, Caddy, Cloudflare, Traefik) pointing to backend port 3000.

---

## 3. Exact Verified Deployment Steps

### 3.1 Backend Deployment via Docker Compose

1. **Clone Repository on Production Host**:
   ```bash
   git clone <REPO_URL> /opt/abase
   cd /opt/abase
   ```

2. **Configure Production Environment File**:
   Create and populate `backend/.env` (or pass via CI/CD secrets):
   ```ini
   PORT=3000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   CLERK_APP_ID=app_...
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_PASSWORD=your-smtp-app-password
   ```

3. **Build and Launch Container**:
   ```bash
   docker compose up --build -d backend
   ```

4. **Verify Container Execution**:
   ```bash
   docker compose ps
   docker compose logs -f backend
   ```

### 3.2 Mobile / Web Deployment Steps

1. **Web Frontend Deployment**:
   ```bash
   cd mobile
   npm ci
   npx expo export --platform web
   ```
   Deploy the resulting `mobile/dist/` directory to static hosting (e.g., Nginx root, AWS S3 + CloudFront, Cloudflare Pages, Vercel).

2. **Native Mobile App Deployment (Android / iOS)**:
   - Configure signing credentials (keystore / provisioning profiles).
   - Generate production builds via local build (`npx expo run:android --variant release`) or EAS Cloud (`eas build --platform all`).
   - Submit `.aab` to Google Play Console and `.ipa` to Apple App Store Connect.

---

## 4. Health Checks & Deployment Verification

### 4.1 Backend Health Endpoint
The backend includes a root health endpoint at `GET /` defined in [`backend/src/index.js:29-35`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/index.js#L29-L35).

#### Verification Command:
```bash
curl -i http://localhost:3000/
```

#### Expected HTTP 200 Response:
```json
{
  "success": true,
  "message": "Server is running",
  "clerkApp": "not set"
}
```

### 4.2 Database Connectivity Verification
Inspect container logs immediately after boot:
```bash
docker logs abase-backend
```
- **Success indicator**: `✅ Database connected: <host>`
- **Failure indicator**: `❌ Error connecting to database:` followed by container exit.

### 4.3 API Routing Verification
Test standard public endpoints:
```bash
# Verify Book listing endpoint
curl -i http://localhost:3000/api/books/

# Verify 404 fallback handler
curl -i http://localhost:3000/api/unknown-route
```
Expected 404 response: `{"success":false,"error":"Route not found"}`

---

## 5. Critical Deployment Failure Points Found in Project

The following code-level issues have been audited and identified in the active codebase:

1. **Hardcoded Local LAN IP in Mobile Client**:
   - Location: [`mobile/src/components/AiChat.tsx:41`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/AiChat.tsx#L41) (`const API_BASE = "http://192.168.1.20:3000"`).
   - *Impact*: In production, any mobile device outside the author's local WiFi network will fail network requests.

2. **Unregistered `/api/ai` Route Endpoint**:
   - Location: Mobile [`AiChat.tsx`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/AiChat.tsx#L42-L43) calls `${API_BASE}/api/ai/chat` and `/api/ai/health`.
   - Code reality: [`backend/src/index.js`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/index.js#L23-L25) only registers `/api/auth`, `/api/books`, and `/api/pdf`.
   - *Impact*: AI chat queries currently return 404 (`{"success":false,"error":"Route not found"}`).

3. **Fatal Process Exit on MongoDB Disconnect**:
   - Location: [`backend/src/lib/db.js:9`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/lib/db.js#L9) (`process.exit(1)`).
   - *Impact*: Transient network glitches to MongoDB Atlas cause the entire Node process to terminate immediately.

4. **Missing Production `start` Script in `backend/package.json`**:
   - Location: [`backend/package.json:6-8`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/package.json#L6-L8) contains only `"dev": "nodemon src/index.js"`.
   - *Impact*: PaaS providers (Render, Heroku, Railway, Azure App Service) that rely on `npm start` will fail to boot unless containerized or explicitly configured with `node src/index.js`.

5. **Runtime Error in `POST /api/auth/login`**:
   - Location: [`backend/src/routes/authRoutes.js:271`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/routes/authRoutes.js#L271) calls `user.comparePassword(password)`.
   - Code reality: [`backend/src/models/User.js`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/models/User.js) schema does not define a `comparePassword` method or a `password` field.
   - *Impact*: Calling login will throw an unhandled exception resulting in HTTP 500.

6. **Email Transport Dependency on Unverified Credentials**:
   - Location: [`backend/src/routes/authRoutes.js:94`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/routes/authRoutes.js#L94) awaits `sendVerificationEmail()`.
   - *Impact*: If `EMAIL_FROM` and `EMAIL_PASSWORD` are invalid or Gmail blocks SMTP, user registration fails with HTTP 500.
