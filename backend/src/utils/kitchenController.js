const Order = require('../models/Order');
const { notifyOrderStatusUpdated } = require('../sockets/notificationSocket');

// @route GET /api/kitchen/orders
// Kitchen-only — get all active orders (paid, preparing, ready) for the dashboard
const getActiveOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: { $in: ['paid', 'preparing', 'ready'] },
    })
      .populate('student', 'name email')
      .sort({ createdAt: 1 }); // oldest first — first come, first served

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/kitchen/orders/:id/status
// Kitchen-only — move an order through the pipeline
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['preparing', 'ready', 'collected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const order = await Order.findById(id).populate('student', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Enforce order status can only move forward, not backward
    const statusFlow = ['placed', 'paid', 'preparing', 'ready', 'collected'];
    const currentIndex = statusFlow.indexOf(order.status);
    const newIndex = statusFlow.indexOf(status);

    if (newIndex <= currentIndex) {
      return res.status(400).json({ message: 'Cannot move order backward in the pipeline' });
    }

    order.status = status;
    await order.save();

    // Broadcast status change across all clients (student order tracking + other kitchen tabs)
    notifyOrderStatusUpdated(order);

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { getActiveOrders, updateOrderStatus };
