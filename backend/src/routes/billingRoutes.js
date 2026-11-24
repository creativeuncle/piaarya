const express = require('express');
const { getCurrentCycle, listBills, exportBills } = require('../controllers/billingController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdminAuth);
router.get('/current-cycle', getCurrentCycle);
router.get('/bills', listBills);
router.get('/bills/export', exportBills);

module.exports = router;
