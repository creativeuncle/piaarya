const express = require('express');
const {
  listProducts,
  getFacets,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.get('/facets', getFacets);
router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', requireAdminAuth, createProduct);
router.put('/:id', requireAdminAuth, updateProduct);
router.delete('/:id', requireAdminAuth, deleteProduct);

module.exports = router;
