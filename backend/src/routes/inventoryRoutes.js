const express = require('express');
const { listInventory, adjustInventory, getHistory } = require('../controllers/inventoryController');

const router = express.Router();

router.get('/', listInventory);
router.post('/:productId/adjust', adjustInventory);
router.get('/:productId/history', getHistory);

module.exports = router;
