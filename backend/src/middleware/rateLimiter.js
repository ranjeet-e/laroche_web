const rateLimit = require('express-rate-limit');

// 1. General Limiter: Protects against DDoS / aggressive scrapers across all API endpoints
// Tuned for high-concurrency campus Wi-Fi (where hundreds of students share 1 public NAT IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Up to 5,000 requests per 15 minutes per IP (supports 300+ students on same Wi-Fi)
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    message: 'Too many requests from this network. Please slow down and try again shortly.',
  },
});

// 2. Strict Auth Limiter: Prevents brute force attacks while allowing batch logins during class breaks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Up to 150 attempts per 15 mins per IP (prevents locking out entire cafe on shared Wi-Fi)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts. Please try again after a few minutes.',
  },
});

// 3. Order Creation Limiter: Per-user quota rather than shared IP quota
// Prevents individual spam while allowing all other students on the same Wi-Fi to order freely
const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 25, // Allow up to 25 order creation actions per 10 mins per student
  keyGenerator: (req) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'You have placed many order requests recently. Please wait a few moments before trying again.',
  },
});

// 4. Upload Limiter: Prevents excessive disk/bandwidth usage for image uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Up to 100 uploads per 15 mins
  keyGenerator: (req) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many upload requests. Please slow down and try again later.',
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
  orderLimiter,
  uploadLimiter,
};
