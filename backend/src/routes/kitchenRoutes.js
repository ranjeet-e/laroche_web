const express = require('express');
const router = express.Router();
const {
  getActiveOrders,
  updateOrderStatus,
  getStoreStatus,
  toggleStoreOrdersStatus,
  getDailySalesLedger,
} = require('../controllers/kitchenController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/orders', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), getActiveOrders);
router.put('/orders/:id/status', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), updateOrderStatus);
router.get('/store-status', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), getStoreStatus);
router.post('/toggle-orders', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), toggleStoreOrdersStatus);
router.get('/daily-sales', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), getDailySalesLedger);

module.exports = router;

