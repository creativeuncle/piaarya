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

async function validateCoupon(req, res, next) {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code: (code || '').toUpperCase().trim() });

    if (!coupon) return res.json({ valid: false, message: 'Coupon code not found' });
    if (!coupon.isActive) return res.json({ valid: false, message: 'This coupon is no longer active' });

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return res.json({ valid: false, message: 'This coupon is not active yet' });
    }
    if (coupon.endDate && now > coupon.endDate) {
      return res.json({ valid: false, message: 'This coupon has expired' });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.json({ valid: false, message: 'This coupon has reached its usage limit' });
    }

    const amount = Number(subtotal) || 0;
    let discountAmount = 0;
    let message = 'Coupon applied';

    if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(coupon.discountValue || 0, amount);
    } else if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((amount * (coupon.discountValue || 0)) / 100);
    } else if (coupon.discountType === 'buy_x_get_y') {
      discountAmount = 0;
      message = `Buy ${coupon.buyQuantity} Get ${coupon.getQuantity} — discount applied at checkout based on items in cart`;
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount,
      message,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAnalytics,
  validateCoupon,
};
