const Order = require('../models/Order');
const CafeSetting = require('../models/CafeSetting');
const { notifyOrderStatusUpdated, notifyStoreStatusChanged } = require('../sockets/notificationSocket');

// Helper to get active store pause status
const getStoreStatusHelper = async () => {
  const setting = await CafeSetting.findOne({ key: 'orders_paused' });
  if (!setting || !setting.value) {
    return { paused: false, reason: '', pausedAt: null, resumeAt: null };
  }

  const data = setting.value;
  // If a timed pause was set and has now elapsed, automatically resolve to not paused
  if (data.paused && data.resumeAt && new Date(data.resumeAt).getTime() <= Date.now()) {
    setting.value = { ...data, paused: false, reason: '', resumeAt: null };
    await setting.save();
    notifyStoreStatusChanged(setting.value);
    return setting.value;
  }

  return data;
};

// @route GET /api/kitchen/store-status
const getStoreStatus = async (req, res, next) => {
  try {
    const status = await getStoreStatusHelper();
    res.status(200).json(status);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/kitchen/toggle-orders
// Kitchen / Admin only — toggle pause on incoming orders (overcrowd management)
const toggleStoreOrdersStatus = async (req, res, next) => {
  try {
    const { paused, reason, durationMinutes } = req.body;

    const isPaused = Boolean(paused);
    const pausedAt = isPaused ? new Date() : null;
    const duration = parseInt(durationMinutes, 10);
    const resumeAt = isPaused && duration > 0 ? new Date(Date.now() + duration * 60 * 1000) : null;

    const value = {
      paused: isPaused,
      reason: reason || (isPaused ? 'Kitchen is currently overcrowded. New orders are temporarily paused.' : ''),
      pausedAt,
      resumeAt,
      updatedBy: req.user?.email || 'kitchen',
    };

    let setting = await CafeSetting.findOne({ key: 'orders_paused' });
    if (setting) {
      setting.value = value;
      setting.updatedBy = req.user?.email || 'kitchen';
      await setting.save();
    } else {
      setting = await CafeSetting.create({
        key: 'orders_paused',
        value,
        updatedBy: req.user?.email || 'kitchen',
      });
    }

    // Broadcast change in real-time to all connected users and kitchen dashboards
    notifyStoreStatusChanged(setting.value);

    res.status(200).json(setting.value);
  } catch (error) {
    next(error);
  }
};

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
    if (status === 'ready' && !order.readyAt) {
      order.readyAt = new Date();
    } else if (status === 'collected' && !order.collectedAt) {
      order.collectedAt = new Date();
    }

    await order.save();

    // Broadcast status change across all clients (student order tracking + other kitchen tabs)
    notifyOrderStatusUpdated(order);

    res.status(200).json(order);

  } catch (error) {
    next(error);
  }
};

// @route GET /api/kitchen/daily-sales
// Returns simple daily sales ledger with order id, student name, items, payment, and timestamp milestones
const getDailySalesLedger = async (req, res, next) => {
  try {
    const { date } = req.query;
    let startOfDay, endOfDay;
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
    }

    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('student', 'name email phone')
      .populate('paymentId', 'status razorpayPaymentId')
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map((o) => {
      const isPaid = ['paid', 'preparing', 'ready', 'collected'].includes(o.status) || o.paymentId?.status === 'paid';
      const itemsList = (o.items || []).map((item) => {
        const addonText = item.addons && item.addons.length > 0
          ? ` (+ ${item.addons.map((a) => a.name).join(', ')})`
          : '';
        return `${item.quantity}x ${item.name}${addonText}`;
      });

      return {
        _id: o._id,
        orderNumber: o.orderNumber,
        customerName: o.student?.name || 'Walk-in / Student',
        customerPhone: o.student?.phone || '',
        customerEmail: o.student?.email || '',
        itemsSummary: itemsList.join(' • ') || 'No items',
        items: o.items || [],
        totalAmount: o.totalAmount || 0,
        status: o.status,
        isPaid,
        paidStatus: isPaid ? 'Paid' : (o.status === 'cancelled' ? 'Cancelled' : 'Unpaid'),
        orderCameAt: o.createdAt,
        preparedAt: o.readyAt || null,
        givenAt: o.collectedAt || null,
      };
    });

    const totalRevenue = formattedOrders
      .filter((o) => o.isPaid && o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const collectedCount = formattedOrders.filter((o) => o.status === 'collected').length;
    const inProgressCount = formattedOrders.filter((o) => ['paid', 'preparing', 'ready'].includes(o.status)).length;

    res.status(200).json({
      date: date || new Date().toISOString().split('T')[0],
      totalOrders: formattedOrders.length,
      totalRevenue,
      collectedCount,
      inProgressCount,
      orders: formattedOrders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveOrders,
  updateOrderStatus,
  getStoreStatus,
  toggleStoreOrdersStatus,
  getStoreStatusHelper,
  getDailySalesLedger,
};

