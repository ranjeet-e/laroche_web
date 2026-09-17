const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  uploadAsset,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getSalesStats,
} = require('../utils/cmsController');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// In-House Asset Upload
router.post('/upload', authMiddleware, roleMiddleware('kitchen'), upload.single('image'), uploadAsset);

// Banners & Promos
router.get('/banners', getBanners);
router.post('/banners', authMiddleware, roleMiddleware('kitchen'), createBanner);
router.put('/banners/:id', authMiddleware, roleMiddleware('kitchen'), updateBanner);
router.delete('/banners/:id', authMiddleware, roleMiddleware('kitchen'), deleteBanner);

// Daily Sales Ledger & Telemetry
router.get('/stats', authMiddleware, roleMiddleware('kitchen'), getSalesStats);

module.exports = router;
