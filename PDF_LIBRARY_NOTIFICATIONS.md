# PDF Library: uploads and customer notifications

## Files
- `backend/src/models/PDF.js`: PDF metadata including title, academic author, uploader, category, course code, scheme, semester, file URL and automatic upload timestamp.
- `backend/src/models/Notification.js`: persistent notifications per customer.
- `backend/src/routes/pdfRoutes.js`: creates the listing and notifications after publishing.
- `backend/src/routes/notificationRoutes.js`: notification list/read APIs.
- `backend/src/index.js`: mounts the notification API.
- `mobile/src/screens/NotificationsScreen.tsx`: reads live notifications from the backend.
- `mobile/src/services/api.ts`: adds PATCH support.

## Upload flow
1. Distributor uploads the PDF binary to Cloudinary or another object-storage service.
2. Distributor submits its secure URL and metadata in the product upload form.
3. Backend saves the PDF record; Mongoose timestamps record when it was created (`createdAt`).
4. Backend creates persistent in-app notifications for other users with role `user`.
5. Customer sees title, author and relative upload time in Notifications & Alerts.

The `author` is the academic/document author; `user` identifies the distributor account. These are different values. Do not store production PDFs directly in GitHub; store the binary in Cloudinary/object storage and metadata in MongoDB.

This delivers in-app notifications when users next open/refresh the notification screen. For push notifications when the app is closed, add Expo Push Notifications and save each customer's push token. Current broadcast notifies all customer-role accounts; subject/semester subscription targeting can be added later.

---

## 📱 Device PDF Reader App Chooser & Viewing Architecture

Google Drive embedded viewer has been replaced with native device app discovery and intent-based viewing:

1. **System PDF App Chooser**:
   - The app uses `IntentLauncher` and `expo-sharing` with Android `ACTION_VIEW` (`application/pdf`) and iOS Document Interaction.
   - When viewing a document, the app queries and displays all installed PDF reader applications on the user's phone (e.g. Adobe Acrobat, Google PDF Viewer, WPS Office, Mi PDF Viewer, Drive PDF Viewer, Samsung Notes).
   - Users can choose any installed reader or set their preferred default app.

2. **Web Browser Native PDF View**:
   - Web view leverages the user's native browser PDF rendering engine directly without third-party Google Drive iframes.
   - Includes direct in-browser view, "Open in New Tab", and one-click direct download.

---

## 📚 Real Study Materials & Purged Demo Data

All mock / dummy placeholder files (`dummy.pdf`, `BigBuckBunny`, `ElephantsDream`, etc.) have been completely removed. The app only retains real user-added study assets:

### 1. Theory of Computation (BCS501) Handwritten Module PDFs
Located in `PDFs/CSE/5th_Sem/` and served via static route `/pdfs/CSE/5th_Sem/`:
- **Module 3**: Context Free Grammars & Pushdown Automata (`BCS501_Module_3_Context_Free_Grammars.pdf`, 1.87 MB, 48 pages)
- **Module 4**: Normal Forms (CNF, GNF) & Pumping Lemma (`BCS501_Module_4_Normal_Forms.pdf`, 1.02 MB, 32 pages)
- **Module 5**: Turing Machines, Decidability & Halting Problem (`BCS501_Module_5_Turing_Machine.pdf`, 1.94 MB, 56 pages)

### 2. TOSCA Automated Software Testing (BISL657A) Lab Videos
Located in `video/` and served via static route `/videos/`:
- **Experiment 8**: TOSCA BISL657A Experiment 8 — Dept. of CSE, Rajeev Institute of Technology (RIT Hassan) (`tosca-bisl657a-experiment-8.mp4`, 17 MB, 720p HD)
- **Experiment 11**: TOSCA BISL657A Experiment 11 — Dept. of CSE, Rajeev Institute of Technology (RIT Hassan) (`tosca-bisl657a-experiment-11.mp4`, 28 MB, 1080p FHD)
