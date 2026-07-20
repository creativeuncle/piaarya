const Coupon = require('../models/Coupon');

async function listCoupons(req, res, next) {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.code = { $regex: search, $options: 'i' };
    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    next(err);
  }
}

async function getCoupon(req, res, next) {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('categories', 'name')
      .populate('products', 'name');
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (err) {
    next(err);
  }
}

function buildPayload(body) {
  const payload = { ...body };
  if (payload.code) payload.code = payload.code.toUpperCase().trim();
  if (!payload.categories?.length) delete payload.categories;
  if (!payload.products?.length) delete payload.products;
  if (payload.usageLimit === '' || payload.usageLimit === undefined) delete payload.usageLimit;
  return payload;
}

async function createCoupon(req, res, next) {
  try {
    const coupon = await Coupon.create(buildPayload(req.body));
    res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
}

async function updateCoupon(req, res, next) {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, buildPayload(req.body), {
      new: true,
      runValidators: true,
    });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (err) {
    next(err);
  }
}

async function deleteCoupon(req, res, next) {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
}

async function getAnalytics(req, res, next) {
  try {
    const coupons = await Coupon.find().select('code discountType usedCount usageLimit isActive');
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter((c) => c.isActive).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    res.json({ totalCoupons, activeCoupons, totalRedemptions, coupons });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCoupons, getCoupon, createCoupon, updateCoupon, deleteCoupon, getAnalytics };
