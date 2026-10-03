const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { upload, uploadToCloudinary, cloudinary } = require('../config/cloudinary');

// @route POST /api/upload/image
// Kitchen staff only — upload a food or promo photo to Cloudinary
router.post(
  '/image',
  authMiddleware,
  roleMiddleware('kitchen', 'cms', 'admin'),
  uploadLimiter,
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
      }

      const folder = req.body.folder || 'laroche_cafe/menu_items';
      const result = await uploadToCloudinary(req.file.buffer, folder);

      res.status(200).json({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      next(error);
    }
  }
);

// @route GET /api/upload/banners
// Public — dynamically fetch all active promo banners from DB and Cloudinary
router.get('/banners', async (req, res, next) => {
  try {
    const Banner = require('../models/Banner');
    const dbBanners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();

    let formattedDbBanners = dbBanners.map((b) => ({
      id: b._id.toString(),
      imageUrl: b.imageUrl,
      title: b.title,
      subtitle: b.subtitle,
      tag: b.tag,
      badgeColor: b.badgeColor,
      bg: b.bg,
    }));

    try {
      // Also query Cloudinary folder "laroche_cafe/banners" if available
      const searchResult = await cloudinary.search
        .expression('folder:laroche_cafe/banners OR tags=promo_banner')
        .sort_by('created_at', 'desc')
        .max_results(8)
        .execute();

      const cldBanners = (searchResult.resources || []).map((resource, idx) => ({
        id: resource.asset_id || `banner_${idx}`,
        imageUrl: resource.secure_url,
        publicId: resource.public_id,
        title: resource.context?.custom?.caption || resource.context?.custom?.title || 'Artisanal Cafe Special',
        subtitle: resource.context?.custom?.alt || 'Freshly prepared and ready for counter pickup.',
        tag: resource.context?.custom?.tag || '🔥 SPECIAL OFFER',
      }));

      formattedDbBanners = [...formattedDbBanners, ...cldBanners];
    } catch (cldErr) {
      // Cloudinary error ignored, use db banners
    }

    res.status(200).json(formattedDbBanners);
  } catch (error) {
    console.warn('Banner query note:', error.message);
    res.status(200).json([]);
  }
});

module.exports = router;
