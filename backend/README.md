# Abase Backend API

RESTful API backend service for the Abase platform built with **Express 5**, **Node.js (ES Modules)**, and **MongoDB (Mongoose)**.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: Express.js (`v5.x`)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk Express SDK (`@clerk/express`) & JSON Web Tokens (`jsonwebtoken`, `bcryptjs`)
- **Media Storage**: Cloudinary SDK
- **Email Service**: Nodemailer
- **Development**: Nodemon

---

## 📂 Directory Structure

```
backend/
├── src/
│   ├── lib/              # Database connection, cloud integrations
│   ├── models/           # Mongoose schemas & data models
│   ├── routes/           # Express route handlers & endpoints
│   ├── utils/            # Helper functions & utility methods
│   └── index.js          # Main server entrypoint
├── Dockerfile            # Container definition
├── package.json
└── .env                  # Environment configuration
```

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
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

### 3. Run Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`.
