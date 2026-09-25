const express = require('express');
const { listInventory, adjustInventory, getHistory } = require('../controllers/inventoryController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/', listInventory);
router.post('/:productId/adjust', adjustInventory);
router.get('/:productId/history', getHistory);

module.exports = router;
