const express = require('express');
const {
  listWishlist,
  getMyWishlist,
  addToWishlist,
  removeFromWishlistByProduct,
  popularProducts,
  removeEntry,
} = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/auth');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.get('/popular', requireAdminAuth, popularProducts);
router.get('/mine', requireAuth, getMyWishlist);
router.post('/', requireAuth, addToWishlist);
router.delete('/product/:productId', requireAuth, removeFromWishlistByProduct);
router.get('/', requireAdminAuth, listWishlist);
router.delete('/:id', requireAdminAuth, removeEntry);

module.exports = router;
