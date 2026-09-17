const fs = require('fs');
const path = require('path');
const Banner = require('../models/Banner');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// @route POST /api/cms/upload
// Kitchen staff only — in-house image upload controller
const uploadAsset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Check if Cloudinary is configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const { uploadToCloudinary } = require('../config/cloudinary');
        const folder = req.body.folder || 'laroche_cafe/cms';
        const result = await uploadToCloudinary(req.file.buffer, folder);
        return res.status(200).json({
          url: result.secure_url,
          filename: result.public_id,
          provider: 'cloudinary',
        });
      } catch (cloudErr) {
        console.warn('Cloudinary upload failed, falling back to in-house local storage:', cloudErr.message);
      }
    }

    // In-House Local Storage Pipeline (Zero SaaS Cost)
    const ext = path.extname(req.file.originalname) || '.jpg';
    const uniqueName = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    fs.writeFileSync(filePath, req.file.buffer);

    // Return the accessible public URL
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

// @route GET /api/cms/banners
const getBanners = async (req, res, next) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const banners = await Banner.find(filter).sort({ displayOrder: 1, createdAt: -1 }).lean();
    res.status(200).json(banners);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/cms/banners
const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, tag, imageUrl, displayOrder, isActive } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Banner title is required' });
    }
    const newBanner = await Banner.create({
      title,
      subtitle: subtitle || '',
      tag: tag || '🔥 SPECIAL OFFER',
      imageUrl: imageUrl || '',
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
    });
    res.status(201).json(newBanner);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/cms/banners/:id
const updateBanner = async (req, res, next) => {
  try {
    const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, {
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

// @route DELETE /api/cms/banners/:id
const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/cms/stats
// Daily Sales Ledger & Real-time Telemetry
const getSalesStats = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Today's orders
    const todayOrders = await Order.find({
      createdAt: { $gte: startOfDay },
      status: { $ne: 'cancelled' },
    }).lean();

    const totalRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidOrdersCount = todayOrders.filter((o) => o.status !== 'placed').length;
    const activeTokensCount = todayOrders.filter((o) => ['paid', 'preparing', 'ready'].includes(o.status)).length;
    const completedOrdersCount = todayOrders.filter((o) => o.status === 'collected').length;

    // Item popularity ledger
    const itemQuantities = {};
    todayOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const name = item.name || 'Unknown Item';
        itemQuantities[name] = (itemQuantities[name] || 0) + (item.quantity || 1);
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
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAsset,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getSalesStats,
};
