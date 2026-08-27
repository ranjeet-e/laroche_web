const MenuItem = require('../models/MenuItem');

// @route GET /api/menu
// Public — anyone (even logged out) can view the menu
const getMenu = async (req, res, next) => {
  try {
    const items = await MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 });
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

module.exports = { getMenu, addMenuItem, updateMenuItem, deleteMenuItem };
