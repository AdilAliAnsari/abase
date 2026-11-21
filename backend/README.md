# Abase Backend API

RESTful API backend service for the Abase platform built with **Express 5**, **Node.js (ES Modules)**, and **MongoDB (Mongoose)**.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: Express.js (`v5.x`)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk Express SDK (`@clerk/express`) & JSON Web Tokens (`jsonwebtoken`, `bcryptjs`)
- **Payment Processing**: Razorpay SDK (`razorpay`, `crypto` webhook signature verification)
- **Media Storage**: Cloudinary SDK (PDF and media asset uploads)
- **Email Service**: Nodemailer
- **Development**: Nodemon

---

## 📂 Directory Structure

```
backend/
├── src/
│   ├── lib/              # Database connection, Cloudinary configuration, Razorpay instance
│   ├── models/           # Mongoose schemas & data models
│   │   ├── User.js       # Customer and distributor accounts
│   │   ├── PDF.js        # PDF documents metadata, schemes, subjects
│   │   ├── Order.js      # Orders, cart items, payment status, receipts
│   │   └── Notification.js # In-app customer & system notifications
│   ├── routes/           # Express route handlers & endpoints
│   │   ├── authRoutes.js         # Register, login, Clerk token sync, profile
│   │   ├── pdfRoutes.js          # PDF catalog, upload, update, stream
│   │   ├── orderRoutes.js        # Create order, order history, status updates
│   │   ├── razorpayRoutes.js     # Create order ID, verify signature, webhook
│   │   └── notificationRoutes.js # List notifications, mark read, read-all
│   ├── utils/            # Helper functions & utility methods
│   └── index.js          # Main server entrypoint
├── Dockerfile            # Container definition
├── package.json
└── .env                  # Environment configuration
```

---

## 🔌 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account with email/password.
- `POST /api/auth/login` — Sign in with email/password and obtain JWT.
- `POST /api/auth/clerk-sync` — Synchronize Clerk session user with MongoDB.
- `GET /api/auth/me` — Retrieve currently logged-in user profile with avatar image.

### PDF Documents & Study Materials (`/api/pdfs`)
- `GET /api/pdfs` — List all PDFs with optional scheme, semester, and subject filters.
- `POST /api/pdfs` — Upload and publish new PDF resource (triggers customer notifications).
- `GET /api/pdfs/:id` — Fetch detailed document metadata and download link.

### Orders & Checkout (`/api/orders`)
- `POST /api/orders` — Create a new order (Cash on Delivery or Razorpay).
- `GET /api/orders` — Fetch user purchase history.
- `GET /api/orders/:id` — Retrieve specific order receipt and status.

### Razorpay Payments (`/api/razorpay`)
- `POST /api/razorpay/create-order` — Generate Razorpay Order ID for checkout.
- `POST /api/razorpay/verify-payment` — Verify HMAC SHA-256 signature and confirm order payment.
- `POST /api/razorpay/webhook` — Handle asynchronous Razorpay payment webhook events.

### Notifications (`/api/notifications`)
- `GET /api/notifications` — Fetch user notification feed.
- `PUT /api/notifications/:id/read` — Mark a single notification as read.
- `PUT /api/notifications/read-all` — Mark all user notifications as read.

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/abase
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Razorpay Payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### 3. Run Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`.
