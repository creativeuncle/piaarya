const express = require('express');
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.get('/', listCategories);
router.post('/', requireAdminAuth, createCategory);
router.put('/:id', requireAdminAuth, updateCategory);
router.delete('/:id', requireAdminAuth, deleteCategory);

module.exports = router;
