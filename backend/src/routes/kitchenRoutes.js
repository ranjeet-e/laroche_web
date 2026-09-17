const express = require('express');
const router = express.Router();
const {
  getActiveOrders,
  updateOrderStatus,
} = require('../controllers/kitchenController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/orders', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), getActiveOrders);
router.put('/orders/:id/status', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), updateOrderStatus);

module.exports = router;
