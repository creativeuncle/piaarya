const express = require('express');
const { listWishlist, popularProducts, removeEntry } = require('../controllers/wishlistController');

const router = express.Router();

router.get('/popular', popularProducts);
router.get('/', listWishlist);
router.delete('/:id', removeEntry);

module.exports = router;
