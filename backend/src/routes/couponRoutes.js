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

const router = express.Router();

router.get('/', listCoupons);
router.get('/analytics', getAnalytics);
router.post('/validate', validateCoupon);
router.get('/:id', getCoupon);
router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;
