const rateLimit = require('express-rate-limit');

// 1. General Limiter: Protects against DDoS / aggressive scrapers across all API endpoints
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Allow up to 500 requests per 15 minutes per IP
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// 2. Strict Auth Limiter: Prevents brute force credential attacks on login, register, & OTP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Allow up to 20 login/register/otp attempts per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// 3. Order Creation Limiter: Prevents spamming order placement & duplicate payment sessions
const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // Allow up to 30 order creation actions per 10 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'You have placed many order requests recently. Please wait a few moments before trying again.',
  },
});

// 4. Upload Limiter: Prevents excessive disk/bandwidth usage for image uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Allow up to 50 uploads per 15 mins per IP
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
