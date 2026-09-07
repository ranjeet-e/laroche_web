const express = require('express');
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  signup,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require('../utils/authController');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/send-otp', authLimiter, sendOtp);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-reset-otp', authLimiter, verifyResetOtp);
router.post('/reset-password', authLimiter, resetPassword);

module.exports = router;

