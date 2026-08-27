const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware('student'), placeOrder);
router.get('/my', authMiddleware, roleMiddleware('student'), getMyOrders);
router.get('/:id', authMiddleware, getOrderById); // student (own) or kitchen (any)

module.exports = router;
