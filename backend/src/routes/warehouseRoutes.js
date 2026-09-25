const express = require('express');
const { listWarehouses, createWarehouse } = require('../controllers/warehouseController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/', listWarehouses);
router.post('/', createWarehouse);

module.exports = router;
