const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// @route POST /api/orders
// Student-only — place a new order (before payment)
const placeOrder = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Extract base item IDs and any attached addon IDs from database
    const baseItemIds = items.map((i) => i.menuItem).filter(Boolean);
    const addonItemIds = items
      .flatMap((i) => (Array.isArray(i.addons) ? i.addons.map((a) => a._id || a.menuItem) : []))
      .filter(Boolean);
    const allDbIds = Array.from(new Set([...baseItemIds, ...addonItemIds]));

    const dbMenuItems = await MenuItem.find({ _id: { $in: allDbIds } });
    const dbItemMap = new Map(dbMenuItems.map((item) => [item._id.toString(), item]));

    const verifiedItems = [];

    for (const item of items) {
      const dbItem = dbItemMap.get(item.menuItem?.toString());
      if (!dbItem) {
        return res.status(400).json({ message: `Item not found or no longer available` });
      }

      if (dbItem.isAvailable === false) {
        return res.status(400).json({ message: `"${dbItem.name}" is currently sold out / unavailable` });
      }

      const quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity < 1 || quantity > 50) {
        return res.status(400).json({ message: `Invalid quantity for "${dbItem.name}"` });
      }

      // Determine server-verified price (including variants if applicable)
      let verifiedBasePrice = dbItem.price;
      if (dbItem.variants && dbItem.variants.length > 0) {
        const matchingVariant = dbItem.variants.find(
          (v) => (item.name && item.name.includes(v.label)) || (item.variant && item.variant === v.label) || v.price === item.price
        );
        if (matchingVariant) {
          verifiedBasePrice = matchingVariant.price;
        }
      }

      // Verify and calculate attached add-ons
      const verifiedAddons = [];
      let addonsTotal = 0;
      if (Array.isArray(item.addons) && item.addons.length > 0) {
        for (const addon of item.addons) {
          const addonDbItem = dbItemMap.get((addon._id || addon.menuItem)?.toString());
          if (addonDbItem && addonDbItem.isAvailable !== false) {
            verifiedAddons.push({
              _id: addonDbItem._id,
              name: addonDbItem.name,
              price: addonDbItem.price,
            });
            addonsTotal += addonDbItem.price;
          } else if (addon.name && typeof addon.price === 'number') {
            // Fallback for custom addon definition
            verifiedAddons.push({
              name: addon.name,
              price: addon.price,
            });
            addonsTotal += addon.price;
          }
        }
      }

      const unitPrice = verifiedBasePrice + addonsTotal;

      verifiedItems.push({
        menuItem: dbItem._id,
        name: item.name || dbItem.name,
        price: unitPrice,
        quantity,
        addons: verifiedAddons,
      });
    }

    const totalAmount = verifiedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Calculate sequential order number (Order #1, #2, #3...)
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const orderNumber = (lastOrder?.orderNumber ? lastOrder.orderNumber : await Order.countDocuments()) + 1;

    const newOrder = await Order.create({
      orderNumber,
      student: req.user.id,
      items: verifiedItems,
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
