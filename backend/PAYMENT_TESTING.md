# Razorpay Payment Gateway Backend - Testing Guide

This guide provides end-to-end instructions for testing the standalone **Razorpay Payment Gateway** backend for **ABaSe** using **Postman**, **Thunder Client**, or **cURL** without requiring any frontend integration.

---

## 1. Razorpay Test Mode Overview

Razorpay operates in two modes: **Test Mode** and **Live Mode**.
- In **Test Mode**, transactions are simulated and no real money is deducted.
- Test Key IDs start with the prefix `rzp_test_`.

---

## 2. Environment Configuration

1. In the `backend/` directory, locate your `.env` file.
2. Ensure the following Razorpay configuration variables are present:

```env
# Razorpay Payment Gateway (Test Mode)
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

> ⚠️ **Security Reminder:** Never commit the `.env` file to version control. The `.gitignore` file is pre-configured to ignore `.env`.

---

## 3. Starting the Backend

### Option A: Running Locally with npm
```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:3000` (or `PORT` specified in `.env`).

### Option B: Running with Docker Compose
From the project root:
```bash
docker compose build
docker compose up
```

---

## 4. API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/payments/create-order` | Creates a Razorpay order & saves record in MongoDB | Optional Clerk / Public |
| `GET` | `/api/payments/:orderId` | Fetches payment & order status directly | Optional Clerk / Public |
| `POST` | `/api/payments/verify` | Server-side signature verification & status confirmation | Optional Clerk / Public |
| `POST` | `/api/payments/webhook` | Razorpay webhook listener with HMAC-SHA256 verification | Signature Verified |

---

## 5. Step-by-Step Testing with Postman / cURL

### Step 1: Create a Payment Order
Creates an order with Razorpay (amount converted to paise) and persists a new payment record in MongoDB.

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/payments/create-order`
- **Headers:** `Content-Type: application/json`

#### Request Body (JSON):
```json
{
    "amount": 500,
    "currency": "INR",
    "receipt": "rcpt_course_101",
    "notes": {
        "courseId": "cs_101",
        "description": "Introduction to Computer Science"
    },
    "customer": {
        "id": "student_101",
        "name": "Alex Student",
        "email": "alex.student@example.com",
        "phone": "9876543210"
    }
}
```

#### cURL Command:
```bash
curl -X POST http://localhost:3000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "currency": "INR",
    "receipt": "rcpt_course_101",
    "notes": {
      "courseId": "cs_101"
    },
    "customer": {
      "id": "student_101",
      "name": "Alex Student",
      "email": "alex.student@example.com",
      "phone": "9876543210"
    }
  }'
```

#### Sample Response (`201 Created`):
```json
{
    "success": true,
    "message": "Payment order created successfully",
    "data": {
        "orderId": "order_ODZ1234567890",
        "razorpayOrderId": "order_ODZ1234567890",
        "keyId": "rzp_test_xxxxxxxxx",
        "amount": 500,
        "amountPaise": 50000,
        "currency": "INR",
        "receipt": "rcpt_course_101",
        "status": "CREATED",
        "customer": {
            "id": "student_101",
            "name": "Alex Student",
            "email": "alex.student@example.com",
            "phone": "9876543210"
        }
    }
}
```

---

### Step 2: Retrieve Payment / Order Status
Fetches the current status of an order from Razorpay and synchronizes with MongoDB.

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/payments/order_ODZ1234567890`

#### cURL Command:
```bash
curl -X GET http://localhost:3000/api/payments/order_ODZ1234567890
```

#### Sample Response (`200 OK`):
```json
{
    "success": true,
    "message": "Payment status retrieved successfully",
    "data": {
        "orderId": "order_ODZ1234567890",
        "razorpayOrderId": "order_ODZ1234567890",
        "razorpayPaymentId": "pay_PDZ1234567890",
        "amount": 500,
        "amountPaise": 50000,
        "currency": "INR",
        "status": "SUCCESS",
        "paymentMethod": "upi",
        "customer": {
            "id": "student_101",
            "name": "Alex Student",
            "email": "alex.student@example.com",
            "phone": "9876543210"
        }
    }
}
```

---

### Step 3: Verify Payment Server-Side
Validates payment signatures cryptographically using HMAC-SHA256 and updates MongoDB status to `SUCCESS` or `FAILED`.

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/payments/verify`
- **Headers:** `Content-Type: application/json`

#### Request Body (JSON):
```json
{
    "razorpay_order_id": "order_ODZ1234567890",
    "razorpay_payment_id": "pay_PDZ1234567890",
    "razorpay_signature": "704400a40f80bc2416b0f2095f9c9bb8c18ecbeea20b6f959c80d4638a53e9a0"
}
```

#### How Payment Signatures are Calculated:
`Signature = Hex(HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET))`

#### Helper Node.js Script to Generate a Test Signature:
```javascript
import crypto from "crypto";

const orderId = "order_ODZ1234567890";
const paymentId = "pay_PDZ1234567890";
const keySecret = process.env.RAZORPAY_KEY_SECRET; // Read from environment

const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

console.log("razorpay_signature:", generatedSignature);
```

#### Sample Response (`200 OK`):
```json
{
    "success": true,
    "message": "Payment verified successfully",
    "data": {
        "isVerified": true,
        "orderId": "order_ODZ1234567890",
        "razorpayOrderId": "order_ODZ1234567890",
        "razorpayPaymentId": "pay_PDZ1234567890",
        "amount": 500,
        "currency": "INR",
        "status": "SUCCESS",
        "paymentMethod": "upi"
    }
}
```

---

### Step 4: Webhook Simulation & Testing
Razorpay sends webhook events for asynchronous payment lifecycle notifications. The endpoint verifies HMAC-SHA256 signatures before modifying records.

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/payments/webhook`
- **Headers:**
  - `Content-Type: application/json`
  - `x-razorpay-signature: <COMPUTED_HMAC_SIGNATURE>`

#### How Webhook Signatures Work:
`Signature = Hex(HMAC-SHA256(rawRequestBody, RAZORPAY_WEBHOOK_SECRET))`

#### Sample Webhook Payload:
```json
{
    "entity": "event",
    "account_id": "acc_xxxxxxxxx",
    "event": "payment.captured",
    "contains": ["payment"],
    "payload": {
        "payment": {
            "entity": {
                "id": "pay_PDZ1234567890",
                "entity": "payment",
                "amount": 50000,
                "currency": "INR",
                "status": "captured",
                "order_id": "order_ODZ1234567890",
                "method": "upi",
                "description": "Course Enrollment"
            }
        }
    },
    "created_at": 1740000000
}
```

#### Sample Webhook Response (`200 OK`):
```json
{
    "success": true,
    "message": "Webhook processed successfully"
}
```

---

## 6. Testing Payment Methods with Razorpay Sandbox

Razorpay Test Mode supports simulated payment instruments:

### 1. UPI Testing
- **Success Virtual Payment Address:** `success@razorpay`
- **Failure Virtual Payment Address:** `failure@razorpay`

### 2. Credit & Debit Cards Testing
| Card Type | Test Card Number | Expiry | CVV | OTP | Result |
|---|---|---|---|---|---|
| **Domestic Success** | `4111 1111 1111 1111` | Any future date (e.g., `12/30`) | `123` | Any (e.g., `123456`) | Success |
| **Mastercard Success**| `5123 4500 0000 0008` | Any future date (e.g., `12/30`) | `123` | Any (e.g., `123456`) | Success |
| **Domestic Failed**  | `4000 0000 0000 0002` | Any future date (e.g., `12/30`) | `123` | N/A | Decline |

### 3. Net Banking Testing
- Choose any test bank (e.g., **State Bank of India**, **HDFC Bank**, **ICICI Bank**).
- On the simulated bank page, click **Success** or **Failure**.

---

## 7. Database Records

All payment transactions are persisted in the `payments` collection in MongoDB with the following schema:
- `orderId` / `razorpayOrderId`: Razorpay order identifier (`order_xxx`)
- `razorpayPaymentId`: Razorpay payment transaction identifier (`pay_xxx`)
- `razorpaySignature`: Cryptographic signature received and verified
- `amount`: Transaction amount in INR (e.g., 500)
- `amountPaise`: Transaction amount in paise (e.g., 50000)
- `currency`: Currency code (INR)
- `receipt`: Merchant receipt reference
- `paymentMethod`: `upi`, `card`, `netbanking`, `wallet`, `emi`
- `status`: `CREATED`, `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `REFUNDED`
- `customer`: Customer ID, Name, Email, Phone
- `notes`: Metadata key-value pairs
- `webhookEvents`: Audit log of all webhook deliveries for duplicate prevention and idempotency.
- `createdAt` / `updatedAt`: Timestamps
