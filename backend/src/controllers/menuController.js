const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// @route GET /api/menu
// Public — anyone can view the menu.
// If query param `all=true` is passed, returns all items (both in-stock and sold-out) for staff/CMS.
const getMenu = async (req, res, next) => {
  try {
    const showAll = req.query.all === 'true';
    const filter = showAll ? {} : { isAvailable: true };

    if (!showAll) {
      // 60s cache for high speed student browsing
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    }

    const items = await MenuItem.find(filter)
      .sort({ category: 1, name: 1 })
      .lean();

    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/menu
// Staff/Kitchen/Admin only — add a new menu item
const addMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, variants, imageUrl, isAvailable } = req.body;

    // Strict Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Valid item name is required' });
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ message: 'Valid category is required' });
    }
    if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
      return res.status(400).json({ message: 'Price must be a valid non-negative number' });
    }

    // Sanitize variants
    const cleanVariants = Array.isArray(variants)
      ? variants
          .filter((v) => v && typeof v.label === 'string' && v.label.trim())
          .map((v) => ({
            label: v.label.trim().slice(0, 50),
            price: !isNaN(v.price) && Number(v.price) >= 0 ? Number(v.price) : Number(price),
          }))
      : [];

    const newItem = await MenuItem.create({
      name: name.trim().slice(0, 100),
      description: typeof description === 'string' ? description.trim().slice(0, 500) : '',
      price: Number(price),
      category: category.trim().slice(0, 50),
      variants: cleanVariants,
      imageUrl: typeof imageUrl === 'string' ? imageUrl.trim().slice(0, 1000) : '',
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    });

    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/menu/:id
// Staff/Kitchen/Admin only — update item details, pricing, availability
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid item ID format' });
    }

    const { name, description, price, category, variants, imageUrl, isAvailable } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      updateData.name = name.trim().slice(0, 100);
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || !category.trim()) {
        return res.status(400).json({ message: 'Category cannot be empty' });
      }
      updateData.category = category.trim().slice(0, 50);
    }

    if (price !== undefined) {
      if (isNaN(price) || Number(price) < 0) {
        return res.status(400).json({ message: 'Price must be a non-negative number' });
      }
      updateData.price = Number(price);
    }

    if (description !== undefined) {
      updateData.description = typeof description === 'string' ? description.trim().slice(0, 500) : '';
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = typeof imageUrl === 'string' ? imageUrl.trim().slice(0, 1000) : '';
    }

    if (isAvailable !== undefined) {
      updateData.isAvailable = Boolean(isAvailable);
    }

    if (variants !== undefined) {
      updateData.variants = Array.isArray(variants)
        ? variants
            .filter((v) => v && typeof v.label === 'string' && v.label.trim())
            .map((v) => ({
              label: v.label.trim().slice(0, 50),
              price: !isNaN(v.price) && Number(v.price) >= 0 ? Number(v.price) : Number(updateData.price || 0),
            }))
        : [];
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updateData, {
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
// Staff/Kitchen/Admin only — remove item permanently
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid item ID format' });
    }

    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({ message: 'Menu item deleted successfully', id });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/menu/popular
// Public — dynamically returns popular items based on the last 30 orders
const getPopularItems = async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');

    // Fetch the last 30 kitchen orders (excluding cancelled)
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

    const sortedIds = Object.keys(itemCounts).sort((a, b) => itemCounts[b] - itemCounts[a]);

    let popularItems = [];
    if (sortedIds.length > 0) {
      const foundItems = await MenuItem.find({
        _id: { $in: sortedIds },
        isAvailable: true,
        category: { $ne: 'Add-ons' },
      }).lean();

      const itemMap = new Map(foundItems.map((item) => [item._id.toString(), item]));
      popularItems = sortedIds
        .map((id) => itemMap.get(id))
        .filter(Boolean);
    }

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

module.exports = {
  getMenu,
  getPopularItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
