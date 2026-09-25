const express = require('express');
const { listZones, createZone, updateZone, deleteZone, calculateShipping } = require('../controllers/shippingController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.get('/zones', requireAdminAuth, listZones);
router.post('/zones', requireAdminAuth, createZone);
router.put('/zones/:id', requireAdminAuth, updateZone);
router.delete('/zones/:id', requireAdminAuth, deleteZone);
router.post('/calculate', calculateShipping);

module.exports = router;
