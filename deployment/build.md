# Build Process & Artifacts Specification

> **Scope**: Verified build procedures, prerequisites, platform-specific packaging, and generated artifacts for `abase` Backend and Mobile.  
> **Source Verification**: Grounded strictly in [`backend/Dockerfile`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/Dockerfile), [`backend/package.json`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/package.json), [`mobile/package.json`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/package.json), [`mobile/app.json`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/app.json), and [`mobile/metro.config.js`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/metro.config.js).

---

## 1. Prerequisites & Tooling Requirements

| Component | Minimum Version | Verified Role / Requirement |
|---|---|---|
| **Node.js** | `>= 22.0.0` | Backend runtime & Docker base image (`node:22-alpine` in [`backend/Dockerfile:1`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/Dockerfile#L1)) |
| **npm** | `>= 10.0.0` | Package manager (lockfiles: `backend/package-lock.json`, `mobile/package-lock.json`) |
| **Docker Engine & CLI** | `>= 24.0.0` | Required for building backend container images |
| **Docker Compose** | `>= 2.20.0` | Required for orchestrated container deployment via [`docker-compose.yml`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/docker-compose.yml) |
| **Expo CLI** | `~57.0.18` (bundled via `npx expo`) | Required for bundling, exporting, and running mobile/web frontend |
| **EAS CLI** | *Not installed in repo* | **UNKNOWN / NEEDS CONFIRMATION**: Required if cloud building standalone Android/iOS binaries |

---

## 2. Backend Build Specification

The backend uses native ES Modules (`"type": "module"` in [`backend/package.json`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/package.json#L11)) and does not require Babel/Webpack/TypeScript compilation. The production build consists of creating an OCI/Docker container image.

### 2.1 Dependency Installation

```bash
# Local development (installs devDependencies including nodemon)
cd backend
npm install

# Production container dependency installation (exact lockfile, production only)
npm ci --omit=dev
```

### 2.2 Production Container Build

The build definition is specified in [`backend/Dockerfile`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/Dockerfile):

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "src/index.js"]
```

#### Docker Image Build Command:
```bash
# Direct Docker build from repository root:
docker build -t abase-backend:latest -f backend/Dockerfile backend/

# Or via Docker Compose:
docker compose build backend
```

### 2.3 Generated Backend Artifacts
- **Artifact Type**: Docker Container Image (`abase-backend:latest`)
- **Base Image**: `node:22-alpine` (~180MB - 250MB final uncompressed footprint)
- **Container Entrypoint**: `node src/index.js`

---

## 3. Mobile / Web Build Specification

The mobile application is an Expo SDK 57 project supporting Web, Android, and iOS targets.

### 3.1 Dependency Installation

```bash
cd mobile
npm install
```

### 3.2 Platform-Specific Builds & Packaging

#### A. Web Build (Static Export)
Expo Web produces a client-side bundle according to `"web": { "output": "single" }` in [`mobile/app.json`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/app.json#L22-L25).

```bash
cd mobile
npx expo export --platform web
```
- **Generated Artifact**: Static web bundle output directory `mobile/dist/` containing `index.html`, JavaScript chunks, and static assets.
- **Hosting Target**: Any static web server (Nginx, Cloudflare Pages, Vercel, Netlify, AWS S3/CloudFront).

#### B. Native Android Build
- **Local Prebuild & Compile**:
  ```bash
  cd mobile
  npx expo prebuild --platform android
  cd android && ./gradlew assembleRelease
  ```
  *Requires Android SDK, JDK 17, and Gradle installed on build machine.*
- **EAS Cloud Build (Alternative)**:
  ```bash
  eas build --platform android --profile production
  ```
  *Status*: `eas.json` is **NOT** present in the repository (Requires initial setup with `eas build:configure`).
- **Generated Artifact**: `.apk` (sideload/testing) or `.aab` (Google Play Store bundle).

#### C. Native iOS Build
- **Local Prebuild & Compile (macOS only)**:
  ```bash
  cd mobile
  npx expo prebuild --platform ios
  cd ios && xcodebuild -workspace abase.xcworkspace -scheme abase -configuration Release
  ```
  *Requires macOS, Xcode 16+, CocoaPods, and Apple Developer certificates.*
- **EAS Cloud Build (Alternative)**:
  ```bash
  eas build --platform ios --profile production
  ```
  *Status*: `eas.json` is **NOT** present in the repository.
- **Generated Artifact**: `.ipa` (App Store package / TestFlight).

---

## 4. Build-Time Environment & Configuration Dependencies

| Component | Build-Time Requirements | Runtime Requirements |
|---|---|---|
| **Backend Docker Image** | Internet connection to pull `node:22-alpine` & npm packages | `MONGO_URI`, `CLERK_SECRET_KEY`, `EMAIL_FROM`, `EMAIL_PASSWORD` |
| **Mobile Web Export** | Node.js, `npm install`, Metro bundler | Hardcoded API target in [`mobile/src/components/AiChat.tsx`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/AiChat.tsx#L41) (*Must be verified before exporting*) |
| **Mobile Native (Android/iOS)** | Android SDK / Xcode / CocoaPods or EAS account | App permissions, Network connectivity |

---

## 5. Build Verification Checklist

Before pushing builds to deployment:
1. Verify `backend/package.json` and `backend/package-lock.json` are synchronized:
   ```bash
   cd backend && npm ci
   ```
2. Verify Docker build succeeds locally without warnings:
   ```bash
   docker build -t abase-backend:test -f backend/Dockerfile backend/
   ```
3. Verify mobile TypeScript and Lint passes:
   ```bash
   cd mobile && npm run lint
   ```
4. Verify mobile web export compiles cleanly:
   ```bash
   cd mobile && npx expo export --platform web
   ```
