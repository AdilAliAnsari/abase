# Rollback & Recovery Strategy

> **Scope**: Verified rollback procedures, recovery mechanisms, data layer migration considerations, and missing capabilities for `abase`.  
> **Source Verification**: Grounded in [`docker-compose.yml`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/docker-compose.yml), [`backend/package.json`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/package.json), [`backend/src/models/`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/models/), and [`mobile/package.json`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/package.json).

---

## 1. Current Rollback Capabilities Overview

| Component | Rollback Capability | Recovery Mechanism | Implemented in Codebase? |
|---|---|---|---|
| **Backend Container** | Version-based container swap | Re-deploy previous Docker image tag or previous Git commit | **MANUAL ONLY** (No automated deployment pipeline) |
| **Backend Config / Secrets** | Reversion of `.env` | Restore previous `.env` file and restart container | **MANUAL ONLY** |
| **Database Schemas & Data** | None | No automated up/down migration tooling present | **NOT IMPLEMENTED** |
| **Web Frontend** | CDN / Static host rollback | Re-upload previous `mobile/dist/` build or switch CDN pointer | **MANUAL ONLY** |
| **Native Mobile (Android/iOS)** | Store rollback not possible | Requires submitting higher version hotfix build | **NOT IMPLEMENTED** (No `expo-updates` OTA configured) |

---

## 2. Backend Recovery Process

### 2.1 Containerized Rollback (Docker Compose)

If a newly deployed backend release fails health checks or introduces critical errors:

#### A. If Using Git & Local Docker Build:
1. Identify the last stable Git commit:
   ```bash
   git log --oneline -n 5
   ```
2. Check out the stable commit:
   ```bash
   git checkout <STABLE_COMMIT_HASH>
   ```
3. Rebuild and restart the container:
   ```bash
   docker compose down
   docker compose up --build -d backend
   ```
4. Verify backend health:
   ```bash
   curl -i http://localhost:3000/
   ```

#### B. If Using Tagged Registry Images:
```bash
# Update docker-compose.yml image tag to previous version:
# image: abase-backend:v1.0.0 (instead of v1.0.1)
docker compose up -d backend
```

---

## 3. Database Migration & Rollback Considerations

### 3.1 Current Status: **NOT IMPLEMENTED**
- **Audit Finding**: The project relies exclusively on Mongoose schema definitions in [`backend/src/models/`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/models/) without any database migration runner (such as `migrate-mongo` or `umzug`).
- **Risk**: If a new release alters document field names, adds required fields, or changes indexing, rolling back the application code will **not** revert the MongoDB database state.

### 3.2 Manual Database Recovery Protocol:
1. **MongoDB Atlas Snapshot**: Before executing any production deployment that modifies data models, trigger a manual snapshot in the MongoDB Atlas Cloud Console.
2. **Restoration**: In case of severe data corruption, restore the database snapshot to a new cluster or point-in-time state via MongoDB Atlas Cloud Console.

---

## 4. Configuration & Secrets Rollback

If environment configuration updates introduce errors (e.g., corrupted `CLERK_SECRET_KEY` or invalid `MONGO_URI`):

1. Restore the previous `backend/.env` configuration file:
   ```bash
   cp backend/.env.backup backend/.env
   ```
2. Restart the backend container to reload environment variables:
   ```bash
   docker compose restart backend
   ```
3. Inspect startup logs to confirm successful database and Clerk handshake:
   ```bash
   docker logs --tail 50 abase-backend
   ```

---

## 5. Mobile & Web Frontend Rollback

### 5.1 Web Application
- If deployed via static hosting (Nginx/S3/Vercel/Netlify), revert the web root directory or redeploy the prior known working `mobile/dist/` build.
- Purge CDN cache (Cloudflare / CloudFront) to invalidate cached JavaScript chunks.

### 5.2 Native Mobile Apps (App Store / Play Store)
- **Native store builds cannot be rolled back instantly by design.** Once a user downloads an `.apk`/`.aab` or `.ipa`, that binary remains on the client device.
- **OTA Updates Status**: `expo-updates` is **NOT** installed in [`mobile/package.json`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/package.json). Instant over-the-air code rollback is therefore **NOT SUPPORTED**.
- **Recovery Method**: Must increment `version` in [`mobile/app.json`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/app.json#L5) and [`mobile/package.json`](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/package.json#L4) (e.g., `1.0.1` -> `1.0.2`), compile a hotfix build, and submit through standard app store review channels.

---

## 6. What is Implemented vs Not Implemented Summary

- **IMPLEMENTED & SUPPORTED**:
  - Container redeployment to previous Git commit via Docker Compose.
  - Manual environment variable reversion and container restart.
  - Health endpoint verification (`GET /`) post-rollback.
- **NOT IMPLEMENTED**:
  - Automated deployment rollback triggers / auto-rollback on failed health check.
  - Database schema migration and down-migration scripts.
  - Over-The-Air (OTA) mobile updates via `expo-updates`.
  - Automated canary or blue/green traffic shifting.
