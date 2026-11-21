# Checkout & Payments: Amazon 1-Click Buy Now & Razorpay

This document details the checkout architecture, payment methods, card choosing protocols, and order processing workflows in Abase.

---

## 🛒 1. Overview of Checkout Flows

Abase provides two checkout workflows:
1. **Amazon 1-Click Buy Now Modal** ([AmazonBuyNowModal.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/components/AmazonBuyNowModal.tsx)): Instant bottom-sheet purchase directly from any book or resource card without navigating away from the current screen.
2. **Standard Cart Checkout** ([CartScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/CartScreen.tsx)): Multi-item purchasing with coupon code redemption, item steppers, and order summary.

---

## ⚡ 2. Amazon 1-Click Buy Now Modal

Triggered by the **Buy Now** button on product cards or the product details screen:

### Features & UI Elements:
- **Delivery Address Selector**: Defaults to saved primary student address with one-tap change support.
- **Prime Delivery Guarantee**: Free delivery indicator with estimated arrival dates.
- **Payment Method Selection**:
  - **Razorpay UPI**: Direct intent selection for Google Pay, PhonePe, Paytm, or generic UPI ID.
  - **Credit / Debit Cards**: Visa, MasterCard, RuPay with CVV security confirmation.
  - **Cash on Delivery (COD)**: Available for physical textbook orders.
  - **Amazon Pay / Digital Wallet**: Instant wallet debit option.

### Smart Card Choosing Protocol:
The card selection section adapts dynamically based on the customer's history:
- **First-Time Customer**:
  - Automatically displays the Card Details entry form (Card Number, Expiry, Name on Card, CVV).
  - Provides a toggle to securely remember the card for future purchases.
- **Returning Customer with 1 Saved Card**:
  - Card entry form is automatically skipped.
  - Displays the masked saved card (e.g. `•••• •••• •••• 4242`) as selected.
- **Returning Customer with Multiple Saved Cards**:
  - Displays the card picker list allowing the user to select their desired card.
  - Includes an **"Add Another Card"** button to open the entry form for new cards.

---

## 💳 3. Razorpay Integration Architecture

### Client Flow (`mobile/`):
1. User confirms order in `AmazonBuyNowModal` or `CartScreen`.
2. App requests an Order ID from `POST /api/razorpay/create-order`.
3. The Razorpay checkout instance initializes:
   - Currency: `INR`
   - Prefill: User's name, email, and phone number from `AuthContext`.
4. On successful authorization, Razorpay returns:
   - `razorpay_payment_id`
   - `razorpay_order_id`
   - `razorpay_signature`
5. App verifies the signature via `POST /api/razorpay/verify-payment`.

### Backend Verification (`backend/`):
The backend validates payment authenticity using HMAC SHA-256 verification:
```js
import crypto from 'crypto';

const generatedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');

if (generatedSignature !== razorpay_signature) {
  throw new Error('Invalid payment signature');
}
```

---

## 📦 4. Order Lifecycle & Status Tracking

After payment verification or COD placement:
1. An order document is created in MongoDB ([Order.js](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/backend/src/models/Order.js)).
2. Order status transitions:
   - `PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PROCESSING` $\rightarrow$ `DELIVERED`
3. Purchased digital assets (PDFs, video lectures) are immediately unlocked in the customer's [HistoryScreen.tsx](file:///c:/Users/adilaliansari/OneDrive/Desktop/abase/mobile/src/screens/HistoryScreen.tsx) with one-click re-download options.
4. An in-app receipt notification is dispatched to the customer's notification feed.
