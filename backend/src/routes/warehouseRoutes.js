const express = require('express');
const { listWarehouses, createWarehouse } = require('../controllers/warehouseController');

const router = express.Router();

router.get('/', listWarehouses);
router.post('/', createWarehouse);

module.exports = router;
