const MenuItem = require('../models/MenuItem');

// @route GET /api/menu
// Public — anyone (even logged out) can view the menu
const getMenu = async (req, res, next) => {
  try {
    // Cache for 60 seconds with stale-while-revalidate for instant subsequent loads
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    const items = await MenuItem.find({ isAvailable: true })
      .sort({ category: 1, name: 1 })
      .lean();
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/menu
// Kitchen-only — add a new menu item
const addMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, variants, imageUrl } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Name and category are required' });
    }

    const newItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      variants,
      imageUrl,
    });

    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/menu/:id
// Kitchen-only — update an item (price, availability, etc.)
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedItem = await MenuItem.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/menu/:id
// Kitchen-only — remove an item entirely
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({ message: 'Menu item deleted' });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/menu/popular
// Public — dynamically returns the most popular items based on the last 30 orders
const getPopularItems = async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    const Order = require('../models/Order');

    // Fetch the last 30 orders submitted to the kitchen (excluding cancelled)
    const recentOrders = await Order.find({
      status: { $ne: 'cancelled' },
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // Map item ID -> total ordered quantity
    const itemCounts = {};
    recentOrders.forEach((order) => {
      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (item.menuItem) {
            const id = item.menuItem.toString();
            itemCounts[id] = (itemCounts[id] || 0) + (item.quantity || 1);
          }
        });
      }
    });

    // Sort item IDs by frequency
    const sortedIds = Object.keys(itemCounts).sort((a, b) => itemCounts[b] - itemCounts[a]);

    let popularItems = [];
    if (sortedIds.length > 0) {
      // Find the corresponding available menu items excluding Add-ons
      const foundItems = await MenuItem.find({
        _id: { $in: sortedIds },
        isAvailable: true,
        category: { $ne: 'Add-ons' },
      }).lean();

      // Maintain order based on ranking
      const itemMap = new Map(foundItems.map((item) => [item._id.toString(), item]));
      popularItems = sortedIds
        .map((id) => itemMap.get(id))
        .filter(Boolean);
    }

    // If fewer than 6 items from recent orders, backfill with signature dishes
    if (popularItems.length < 6) {
      const existingIds = new Set(popularItems.map((i) => i._id.toString()));
      const fallbackItems = await MenuItem.find({
        _id: { $nin: Array.from(existingIds) },
        isAvailable: true,
        category: { $ne: 'Add-ons' },
      })
        .limit(8 - popularItems.length)
        .lean();

      popularItems = [...popularItems, ...fallbackItems];
    }

    res.status(200).json(popularItems.slice(0, 8));
  } catch (error) {
    next(error);
  }
};

module.exports = { getMenu, getPopularItems, addMenuItem, updateMenuItem, deleteMenuItem };
