const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getPublicStoreStatus,
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { orderLimiter } = require('../middleware/rateLimiter');

router.get('/store-status', getPublicStoreStatus);
router.post('/', authMiddleware, roleMiddleware('student'), orderLimiter, placeOrder);
router.get('/my', authMiddleware, roleMiddleware('student'), getMyOrders);
router.get('/:id', authMiddleware, getOrderById); // student (own) or kitchen (any)

module.exports = router;

