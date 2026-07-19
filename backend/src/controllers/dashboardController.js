const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');

async function getStats(req, res, next) {
  try {
    const [
      revenueAgg,
      totalOrders,
      processingOrders,
      totalCustomers,
      totalProducts,
      totalCategories,
      totalReviews,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ status: 'processing' }),
      Customer.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      Review.countDocuments(),
    ]);

    res.json({
      totalRevenue: revenueAgg[0]?.total || 0,
      totalOrders,
      processingOrders,
      totalCustomers,
      totalProducts,
      totalCategories,
      totalReviews,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
