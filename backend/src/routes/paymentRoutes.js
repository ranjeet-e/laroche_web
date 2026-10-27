const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  handleRazorpayWebhook,
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/create-order', authMiddleware, roleMiddleware('student'), createRazorpayOrder);
router.post('/verify', authMiddleware, roleMiddleware('student'), verifyPayment);
// Public server-to-server webhook endpoint for Razorpay asynchronous payment events
router.post('/webhook', handleRazorpayWebhook);

module.exports = router;
