const express = require('express');
const multer = require('multer');
const {
  listProducts,
  getFacets,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  importProductsCsv,
  downloadImportTemplate,
} = require('../controllers/productController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();
const csvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/facets', getFacets);
router.get('/import-template', requireAdminAuth, downloadImportTemplate);
router.post('/import-csv', requireAdminAuth, csvUpload.single('file'), importProductsCsv);
router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', requireAdminAuth, createProduct);
router.put('/:id', requireAdminAuth, updateProduct);
router.delete('/:id', requireAdminAuth, deleteProduct);

module.exports = router;
