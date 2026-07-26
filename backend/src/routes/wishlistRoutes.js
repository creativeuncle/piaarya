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

const router = express.Router();

router.get('/popular', popularProducts);
router.get('/mine', requireAuth, getMyWishlist);
router.post('/', requireAuth, addToWishlist);
router.delete('/product/:productId', requireAuth, removeFromWishlistByProduct);
router.get('/', listWishlist);
router.delete('/:id', removeEntry);

module.exports = router;
