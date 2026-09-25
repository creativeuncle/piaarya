const express = require('express');
const {
  listCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAnalytics,
  validateCoupon,
} = require('../controllers/couponController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.get('/', requireAdminAuth, listCoupons);
router.get('/analytics', requireAdminAuth, getAnalytics);
router.post('/validate', validateCoupon);
router.get('/:id', requireAdminAuth, getCoupon);
router.post('/', requireAdminAuth, createCoupon);
router.put('/:id', requireAdminAuth, updateCoupon);
router.delete('/:id', requireAdminAuth, deleteCoupon);

module.exports = router;
