const Order = require('../models/Order');
const { isOrderingAllowed } = require('./cafeSchedule');

// @route POST /api/orders
// Student-only — place a new order (before payment)
const placeOrder = async (req, res, next) => {
  try {
    const scheduleCheck = isOrderingAllowed();
    if (!scheduleCheck.allowed) {
      return res.status(400).json({ message: scheduleCheck.message });
    }

    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Calculate sequential order number (Order #1, #2, #3...)
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const orderNumber = (lastOrder?.orderNumber ? lastOrder.orderNumber : await Order.countDocuments()) + 1;

    const newOrder = await Order.create({
      orderNumber,
      student: req.user.id,
      items,
      totalAmount,
      status: 'placed',
    });

    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/orders/my
// Student-only — get logged-in student's order history
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/orders/:id
// Student or kitchen — get a single order's details (for tracking)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('student', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Students can only view their own orders; kitchen can view any
    if (req.user.role === 'student' && order.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById };
