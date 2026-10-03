const express = require('express');
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  signup,
  login,
  googleLogin,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { testEmailConnection } = require('../utils/emailService');

router.post('/send-otp', authLimiter, sendOtp);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleLogin);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-reset-otp', authLimiter, verifyResetOtp);
router.post('/reset-password', authLimiter, resetPassword);

// Live SMTP diagnostics route - Protected: Only authenticated Admins can trigger email diagnostics in non-production
router.get('/test-email', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Diagnostics disabled in production mode' });
  }
  const recipient = req.query.to || null;
  const result = await testEmailConnection(recipient);
  res.status(result.success ? 200 : 500).json(result);
});

module.exports = router;
