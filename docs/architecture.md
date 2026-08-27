# Architecture — Campus Cafe Preorder System

## Overview
A web app where students preorder food from the college canteen, pay online via Razorpay,
and collect food once it's marked ready by kitchen staff. Two user roles: **Student** and
**Kitchen Staff**, each with separate login and dashboard.

## Tech Stack
- **Frontend:** React (Vite), Context API for state, Axios for API calls, Socket.IO client for real-time updates
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose ODM)
- **Payments:** Razorpay (test mode)
- **Real-time:** Socket.IO
- **Auth:** JWT-based sessions

## High-Level Flow

1. **Student Login**
   - Student enters college email → validated against regex
     `^([a-zA-Z]+)\.([a-zA-Z]+)(\d+)@([a-zA-Z0-9]+)\.([a-zA-Z]{2,})\.([a-zA-Z]{2,})$`
   - OTP/password auth → JWT issued → stored client-side → attached to all API requests

2. **Browse & Order**
   - Student views `Menu.jsx` → adds items to cart (`CartContext`)
   - Proceeds to `Checkout.jsx`

3. **Payment (Razorpay)**
   - Frontend calls backend `POST /api/payment/create-order`
   - Backend creates a Razorpay order (test keys) → returns order ID to frontend
   - Frontend opens Razorpay checkout modal
   - On success, Razorpay returns payment ID + signature → sent to backend
   - Backend verifies signature (`paymentController.js`) → marks `Order.status = "paid"`

4. **Kitchen Side**
   - Kitchen staff logs in via separate `KitchenLogin.jsx` (single shared ID/password)
   - `KitchenDashboard.jsx` shows live queue of paid orders (via Socket.IO)
   - Staff updates status: `preparing` → `ready`

5. **Notifications**
   - When kitchen marks an order `ready`, `notificationSocket.js` emits an event
   - Student's `OrderTracking.jsx` (subscribed via `useSocket.js`) updates instantly
   - Optional: push/email notification via `sendNotification.js`

6. **Collection**
   - Student shows order ID / QR at counter → staff marks `collected`
 ## Order Status State Machine
 placed → paid → preparing → ready → collected
↘ (payment fail) → cancelled


## Roles & Access Control
- `roleMiddleware.js` restricts kitchen routes (`/api/kitchen/*`) to kitchen-role JWTs only
- Student routes (`/api/orders`, `/api/payment`) restricted to student-role JWTs
- Email regex enforced both client-side (UX) and server-side (`emailValidator.js`, source of truth)

## Data Models (summary)
- **User** — email, passwordHash, role (student/kitchen)
- **MenuItem** — name, price, category, availability
- **Order** — studentId, items[], totalAmount, status, timestamps
- **Payment** — orderId, razorpayOrderId, razorpayPaymentId, signature, status

## Real-Time Layer
- Single Socket.IO server (`notificationSocket.js`) attached to Express server
- Rooms: `kitchen` (all kitchen staff), `student:<userId>` (per-student updates)
- Events: `new_order` (→ kitchen room), `order_ready` (→ specific student room)

## Folder Structure
See repo root — `frontend/` and `backend/` as separate top-level folders (details in README.md).




## Order Status State Machine
