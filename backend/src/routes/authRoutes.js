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
const { testEmailConnection } = require('../utils/emailService');

router.post('/send-otp', authLimiter, sendOtp);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-reset-otp', authLimiter, verifyResetOtp);
router.post('/reset-password', authLimiter, resetPassword);

// Live SMTP diagnostics route
router.get('/test-email', async (req, res) => {
  const recipient = req.query.to || null;
  const result = await testEmailConnection(recipient);
  res.status(result.success ? 200 : 500).json(result);
});

module.exports = router;

