# La Roche Cafe — API & Route Endpoints

This document outlines all public, student, kitchen, and CMS endpoints across the La Roche Cafe platform.

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/send-otp` | Public | Send 6-digit SMS OTP for student authentication |
| `POST` | `/api/auth/verify-otp` | Public | Verify SMS OTP and return JWT token + user profile |
| `POST` | `/api/auth/signup` | Public | Student email/phone signup |
| `POST` | `/api/auth/login` | Public | Email + password login (Student, Kitchen, CMS Admin) |
| `POST` | `/api/auth/forgot-password` | Public | Send password reset verification code |
| `POST` | `/api/auth/reset-password` | Public | Reset password using verified reset code |

---

## 2. Content Management System (CMS) Endpoints (`/api/cms`)
*Protected by `authMiddleware` + `roleMiddleware('cms', 'admin')`*

### Overview & Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cms/stats` | Summary metrics: total items, active/out-of-stock items, categories, total orders |
| `GET` | `/api/cms/categories` | Get all distinct menu categories |

### Menu Management
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cms/menu` | List all menu items with search (`?search=`), category filter (`?category=`), availability filter (`?isAvailable=`) |
| `GET` | `/api/cms/menu/:id` | Fetch single menu item details |
| `POST` | `/api/cms/menu` | Create a new menu item (Name, Category, Price, Variants, Description, Image URL) |
| `PUT` | `/api/cms/menu/:id` | Update existing menu item properties |
| `PATCH` | `/api/cms/menu/:id/toggle` | Quick toggle item between "In Stock" and "Out of Stock" |
| `DELETE` | `/api/cms/menu/:id` | Permanently remove menu item |

### Promotional Banners
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cms/banners` | Fetch all promo banners (active & inactive) |
| `POST` | `/api/cms/banners` | Create a new customer promo banner |
| `PUT` | `/api/cms/banners/:id` | Update banner details |
| `PATCH` | `/api/cms/banners/:id/toggle` | Toggle banner active state |
| `DELETE` | `/api/cms/banners/:id` | Delete promo banner |

### Store Settings & Schedules
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cms/settings` | Get cafe settings (announcement banner, opening/closing hours) |
| `PUT` | `/api/cms/settings` | Update cafe settings |

---

## 3. Media & Upload Endpoints (`/api/upload`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/upload/image` | Kitchen, CMS, Admin | Upload food / promo image to Cloudinary (returns secure CDN URL) |
| `GET` | `/api/upload/banners` | Public | Dynamically fetch active promo banners from DB & Cloudinary |

---

## 4. Customer Menu & Public Endpoints (`/api/menu`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/menu` | Public | Get all available menu items grouped by category |
| `GET` | `/api/menu/popular` | Public | Dynamically calculate top 8 popular dishes from recent orders |

---

## 5. Orders & Payments (`/api/orders`, `/api/payment`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Student | Place a new order |
| `GET` | `/api/orders` | Student | Fetch order history |
| `GET` | `/api/orders/:id` | Student | Fetch specific order status and QR pass |
| `POST` | `/api/payment/create-order` | Student | Initiate Razorpay order |
| `POST` | `/api/payment/verify` | Student | Verify Razorpay HMAC signature |

---

## 6. Kitchen Display System (KDS) (`/api/kitchen`)
*Protected by `roleMiddleware('kitchen')`*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/kitchen/orders` | Live order queue |
| `PUT` | `/api/kitchen/orders/:id/status` | Update order status (`preparing`, `ready`, `collected`, `cancelled`) |
| `PUT` | `/api/kitchen/menu/:id/toggle` | Toggle stock availability from kitchen |

---

## 7. Account Seeder Scripts

- **Kitchen Account**: `node backend/createKitchenUser.js`
  - Default Email: `kitchen@larochecafe.com`
  - Default Password: `kitchen123`
- **CMS Admin Account**: `node backend/createCmsUser.js`
  - Default Email: `cms@larochecafe.com`
  - Default Password: `cms123`
