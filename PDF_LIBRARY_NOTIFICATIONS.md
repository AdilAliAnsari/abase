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
