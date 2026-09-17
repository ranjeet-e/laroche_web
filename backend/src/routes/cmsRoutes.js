const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
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
} = require('../controllers/cmsController');

// Multer in-memory storage (10MB maximum limit)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// 1. In-House Asset Upload (Authorized Staff & CMS Only)
router.post(
  '/upload',
  authMiddleware,
  roleMiddleware('kitchen', 'cms', 'admin'),
  upload.single('image'),
  uploadAsset
);

// 2. Menu Item Operations (CMS Portal)
router.get('/menu', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), getAllMenuItems);
router.get('/menu/:id', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), getMenuItemById);
router.post('/menu', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), createMenuItem);
router.put('/menu/:id', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), updateMenuItem);
router.patch('/menu/:id/toggle', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), toggleItemAvailability);
router.delete('/menu/:id', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), deleteMenuItem);
router.get('/categories', getCategories);

// 3. Promo Banners Operations
router.get('/banners', getBanners); // Public read for customer carousel
router.post('/banners', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), createBanner);
router.put('/banners/:id', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), updateBanner);
router.patch('/banners/:id/toggle', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), toggleBanner);
router.delete('/banners/:id', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), deleteBanner);

// 4. Daily Sales Ledger & Telemetry (Authorized Staff & CMS Only)
router.get('/stats', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), getSalesStats);

// 5. Cafe Settings & Schedule
router.get('/settings', getCafeSettings);
router.put('/settings', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), updateCafeSetting);

module.exports = router;
