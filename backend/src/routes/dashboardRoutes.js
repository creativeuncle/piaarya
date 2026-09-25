const express = require('express');
const { getStats } = require('../controllers/dashboardController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/stats', getStats);

module.exports = router;
