const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
} = require('../utils/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/create-order', authMiddleware, roleMiddleware('student'), createRazorpayOrder);
router.post('/verify', authMiddleware, roleMiddleware('student'), verifyPayment);

module.exports = router;
