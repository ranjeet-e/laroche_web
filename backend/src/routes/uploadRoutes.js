const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { upload, uploadToCloudinary, cloudinary } = require('../config/cloudinary');

// @route POST /api/upload/image
// Kitchen staff only — upload a food or promo photo to Cloudinary
router.post(
  '/image',
  authMiddleware,
  roleMiddleware('kitchen'),
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
// Public — dynamically fetch all promo banners uploaded to Cloudinary folder "laroche_cafe/banners"
router.get('/banners', async (req, res, next) => {
  try {
    // Search for images in folder laroche_cafe/banners or tagged promo_banner
    const searchResult = await cloudinary.search
      .expression('folder:laroche_cafe/banners OR tags=promo_banner')
      .sort_by('created_at', 'desc')
      .max_results(8)
      .execute();

    const banners = (searchResult.resources || []).map((resource, idx) => ({
      id: resource.asset_id || `banner_${idx}`,
      imageUrl: resource.secure_url,
      publicId: resource.public_id,
      title: resource.context?.custom?.caption || resource.context?.custom?.title || 'Artisanal Cafe Special',
      subtitle: resource.context?.custom?.alt || 'Freshly prepared and ready for counter pickup.',
      tag: resource.context?.custom?.tag || '🔥 SPECIAL OFFER',
    }));

    res.status(200).json(banners);
  } catch (error) {
    console.warn('Cloudinary banner query note:', error.message);
    res.status(200).json([]);
  }
});

module.exports = router;
