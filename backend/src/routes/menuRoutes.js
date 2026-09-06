const express = require('express');
const router = express.Router();
const {
  getMenu,
  getPopularItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../utils/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', getMenu); // public
router.get('/popular', getPopularItems); // public dynamic popular items
router.post('/', authMiddleware, roleMiddleware('kitchen'), addMenuItem);
router.put('/:id', authMiddleware, roleMiddleware('kitchen'), updateMenuItem);
router.delete('/:id', authMiddleware, roleMiddleware('kitchen'), deleteMenuItem);

module.exports = router;
