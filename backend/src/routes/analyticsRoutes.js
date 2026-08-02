const express = require('express');
const { getSummary, getSalesTrend, getTopProducts, getOrderStatusBreakdown } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/summary', getSummary);
router.get('/sales-trend', getSalesTrend);
router.get('/top-products', getTopProducts);
router.get('/order-status', getOrderStatusBreakdown);

module.exports = router;
