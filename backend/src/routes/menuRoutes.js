const express = require('express');
const router = express.Router();
const {
  getMenu,
  getPopularItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public catalog routes
router.get('/', getMenu);
router.get('/popular', getPopularItems);

// Protected Staff & CMS Mutation Routes
router.post('/', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), addMenuItem);
router.put('/:id', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), updateMenuItem);
router.delete('/:id', authMiddleware, roleMiddleware('kitchen', 'cms', 'admin'), deleteMenuItem);

module.exports = router;
