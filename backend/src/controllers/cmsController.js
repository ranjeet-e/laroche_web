const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Banner = require('../models/Banner');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const CafeSetting = require('../models/CafeSetting');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Allowed MIME types for uploaded assets
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

// ==========================================
// 1. IN-HOUSE ASSET UPLOAD
// ==========================================
// @route POST /api/cms/upload
const uploadAsset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // 1. Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(req.file.mimetype)) {
      return res.status(400).json({
        message: 'Invalid file type. Allowed formats: JPEG, PNG, WebP, GIF, SVG',
      });
    }

    // 2. Validate and sanitize file extension
    const originalExt = path.extname(req.file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(originalExt) ? originalExt : '.jpg';

    // 3. Fallback to Cloudinary if configured
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const { uploadToCloudinary } = require('../config/cloudinary');
        const folder = typeof req.body.folder === 'string' ? req.body.folder.slice(0, 50) : 'laroche_cafe/cms';
        const result = await uploadToCloudinary(req.file.buffer, folder);
        return res.status(200).json({
          url: result.secure_url,
          filename: result.public_id,
          provider: 'cloudinary',
        });
      } catch (cloudErr) {
        console.warn('Cloudinary upload failed, falling back to in-house disk storage:', cloudErr.message);
      }
    }

    // 4. In-House Local Storage Pipeline (Zero SaaS Cost)
    const uniqueName = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${safeExt}`;
    const safeFilePath = path.join(uploadsDir, path.basename(uniqueName));

    fs.writeFileSync(safeFilePath, req.file.buffer);

    const publicUrl = `/uploads/${uniqueName}`;

    res.status(200).json({
      url: publicUrl,
      filename: uniqueName,
      provider: 'in-house',
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. MENU ITEMS MANAGEMENT (CMS)
// ==========================================
// @route GET /api/cms/menu
const getAllMenuItems = async (req, res, next) => {
  try {
    const { category, isAvailable, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (isAvailable !== undefined && isAvailable !== 'all') {
      filter.isAvailable = isAvailable === 'true';
    }

    if (search && typeof search === 'string' && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 }).lean();
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/cms/menu/:id
const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }
    const item = await MenuItem.findById(id).lean();
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/cms/menu
const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, variants, imageUrl, isAvailable } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Item name is required' });
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ message: 'Item category is required' });
    }
    if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
      return res.status(400).json({ message: 'Valid positive price is required' });
    }

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

// @route PUT /api/cms/menu/:id
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid menu item ID' });
    }

    const { name, description, price, category, variants, imageUrl, isAvailable } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ message: 'Name cannot be empty' });
      updateData.name = name.trim().slice(0, 100);
    }
    if (category !== undefined) {
      if (typeof category !== 'string' || !category.trim()) return res.status(400).json({ message: 'Category cannot be empty' });
      updateData.category = category.trim().slice(0, 50);
    }
    if (price !== undefined) {
      if (isNaN(price) || Number(price) < 0) return res.status(400).json({ message: 'Price must be non-negative' });
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

// @route PATCH /api/cms/menu/:id/toggle
const toggleItemAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.status(200).json({
      message: `Item marked as ${item.isAvailable ? 'In Stock' : 'Out of Stock'}`,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/cms/menu/:id
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid item ID' });
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

// @route GET /api/cms/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await MenuItem.distinct('category');
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. HERO PROMO BANNERS MANAGEMENT
// ==========================================
// @route GET /api/cms/banners
const getBanners = async (req, res, next) => {
  try {
    const showAll = req.query.all === 'true';
    const filter = showAll ? {} : { isActive: true };
    const banners = await Banner.find(filter).sort({ displayOrder: 1, createdAt: -1 }).lean();
    res.status(200).json(banners);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/cms/banners
const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, tag, imageUrl, displayOrder, isActive, badgeColor, bg } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Banner headline / title is required' });
    }

    const newBanner = await Banner.create({
      title: title.trim().slice(0, 120),
      subtitle: typeof subtitle === 'string' ? subtitle.trim().slice(0, 300) : '',
      tag: typeof tag === 'string' && tag.trim() ? tag.trim().slice(0, 50) : '🔥 SPECIAL OFFER',
      imageUrl: typeof imageUrl === 'string' ? imageUrl.trim().slice(0, 1000) : '',
      badgeColor: typeof badgeColor === 'string' ? badgeColor : 'bg-terracotta text-white',
      bg: typeof bg === 'string' ? bg : 'bg-gradient-to-r from-espresso via-espresso-light to-stone-900',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      displayOrder: !isNaN(displayOrder) ? Number(displayOrder) : 0,
    });

    res.status(201).json(newBanner);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/cms/banners/:id
const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid banner ID' });
    }

    const updateData = {};
    if (req.body.title !== undefined) {
      if (typeof req.body.title !== 'string' || !req.body.title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty' });
      }
      updateData.title = req.body.title.trim().slice(0, 120);
    }
    if (req.body.subtitle !== undefined) {
      updateData.subtitle = typeof req.body.subtitle === 'string' ? req.body.subtitle.trim().slice(0, 300) : '';
    }
    if (req.body.tag !== undefined) {
      updateData.tag = typeof req.body.tag === 'string' ? req.body.tag.trim().slice(0, 50) : '🔥 SPECIAL OFFER';
    }
    if (req.body.imageUrl !== undefined) {
      updateData.imageUrl = typeof req.body.imageUrl === 'string' ? req.body.imageUrl.trim().slice(0, 1000) : '';
    }
    if (req.body.badgeColor !== undefined) {
      updateData.badgeColor = typeof req.body.badgeColor === 'string' ? req.body.badgeColor : 'bg-terracotta text-white';
    }
    if (req.body.bg !== undefined) {
      updateData.bg = typeof req.body.bg === 'string' ? req.body.bg : 'bg-gradient-to-r from-espresso via-espresso-light to-stone-900';
    }
    if (req.body.isActive !== undefined) {
      updateData.isActive = Boolean(req.body.isActive);
    }
    if (req.body.displayOrder !== undefined) {
      updateData.displayOrder = Number(req.body.displayOrder) || 0;
    }

    const updated = await Banner.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// @route PATCH /api/cms/banners/:id/toggle
const toggleBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid banner ID' });
    }

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json(banner);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/cms/banners/:id
const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid banner ID' });
    }

    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. DAILY SALES LEDGER & TELEMETRY
// ==========================================
// @route GET /api/cms/stats
const getSalesStats = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [todayOrders, totalItems, availableItems, outOfStockItems, categories, totalOrders] = await Promise.all([
      Order.find({ createdAt: { $gte: startOfDay }, status: { $ne: 'cancelled' } }).lean(),
      MenuItem.countDocuments(),
      MenuItem.countDocuments({ isAvailable: true }),
      MenuItem.countDocuments({ isAvailable: false }),
      MenuItem.distinct('category'),
      Order.countDocuments(),
    ]);

    const totalRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const paidOrdersCount = todayOrders.filter((o) => o.status !== 'placed').length;
    const activeTokensCount = todayOrders.filter((o) => ['paid', 'preparing', 'ready'].includes(o.status)).length;
    const completedOrdersCount = todayOrders.filter((o) => o.status === 'collected').length;

    // Item popularity leaderboard
    const itemQuantities = {};
    todayOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const name = item.name || 'Artisanal Dish';
        itemQuantities[name] = (itemQuantities[name] || 0) + (Number(item.quantity) || 1);
      });
    });

    const topSelling = Object.entries(itemQuantities)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    res.status(200).json({
      todayRevenue: totalRevenue,
      todayOrdersCount: todayOrders.length,
      paidOrdersCount,
      activeTokensCount,
      completedOrdersCount,
      topSelling,
      totalItems,
      availableItems,
      outOfStockItems,
      totalCategories: categories.length,
      categories,
      totalOrders,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. CAFE SETTINGS & SCHEDULE
// ==========================================
// @route GET /api/cms/settings
const getCafeSettings = async (req, res, next) => {
  try {
    const settings = await CafeSetting.find().lean();
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    res.status(200).json(settingsMap);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/cms/settings
const updateCafeSetting = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ message: 'Valid setting key is required' });
    }

    const updated = await CafeSetting.findOneAndUpdate(
      { key: key.trim() },
      { key: key.trim(), value: typeof value === 'string' ? value.trim() : value, updatedBy: req.user?.name || req.user?.id || 'admin' },
      { upsert: true, new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAsset,
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleItemAvailability,
  deleteMenuItem,
  getCategories,
  getBanners,
  createBanner,
  updateBanner,
  toggleBanner,
  deleteBanner,
  getSalesStats,
  getCafeSettings,
  updateCafeSetting,
};
