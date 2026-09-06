const express = require('express');
const router = express.Router();
const {
  getActiveOrders,
  updateOrderStatus,
} = require('../utils/kitchenController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/orders', authMiddleware, roleMiddleware('kitchen'), getActiveOrders);
router.put('/orders/:id/status', authMiddleware, roleMiddleware('kitchen'), updateOrderStatus);

module.exports = router;
