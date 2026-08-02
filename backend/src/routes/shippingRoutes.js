const express = require('express');
const { listZones, createZone, updateZone, deleteZone, calculateShipping } = require('../controllers/shippingController');

const router = express.Router();

router.get('/zones', listZones);
router.post('/zones', createZone);
router.put('/zones/:id', updateZone);
router.delete('/zones/:id', deleteZone);
router.post('/calculate', calculateShipping);

module.exports = router;
