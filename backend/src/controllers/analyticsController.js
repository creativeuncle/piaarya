const Order = require('../models/Order');
const Customer = require('../models/Customer');

function dateRange(query) {
  const to = query.to ? new Date(query.to) : new Date();
  const from = query.from ? new Date(query.from) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

const REVENUE_MATCH = { status: { $nin: ['cancelled', 'refunded'] } };

async function getSummary(req, res, next) {
  try {
    const { from, to } = dateRange(req.query);
    const match = { ...REVENUE_MATCH, createdAt: { $gte: from, $lte: to } };

    const [revenueAgg, orderCount, customerIdsInRange] = await Promise.all([
      Order.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.countDocuments(match),
      Order.distinct('customer', match),
    ]);

    const revenue = revenueAgg[0]?.total || 0;
    const avgOrderValue = orderCount > 0 ? Math.round((revenue / orderCount) * 100) / 100 : 0;

    const newCustomers = await Customer.countDocuments({ createdAt: { $gte: from, $lte: to } });
    const returningCustomers = Math.max(customerIdsInRange.length - newCustomers, 0);

    res.json({ revenue, orders: orderCount, avgOrderValue, newCustomers, returningCustomers });
  } catch (err) {
    next(err);
  }
}

async function getSalesTrend(req, res, next) {
  try {
    const { from, to } = dateRange(req.query);
    const groupBy = ['day', 'week', 'month'].includes(req.query.groupBy) ? req.query.groupBy : 'day';
    const dateFormat = groupBy === 'month' ? '%Y-%m' : groupBy === 'week' ? '%G-W%V' : '%Y-%m-%d';

    const rows = await Order.aggregate([
      { $match: { ...REVENUE_MATCH, createdAt: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(rows.map((r) => ({ date: r._id, revenue: r.revenue, orders: r.orders })));
  } catch (err) {
    next(err);
  }
}

async function getTopProducts(req, res, next) {
  try {
    const { from, to } = dateRange(req.query);
    const limit = Number(req.query.limit) || 10;

    const rows = await Order.aggregate([
      { $match: { ...REVENUE_MATCH, createdAt: { $gte: from, $lte: to } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
      {
        $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: { $ifNull: ['$product.name', 'Deleted product'] },
          unitsSold: 1,
          revenue: 1,
        },
      },
    ]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getOrderStatusBreakdown(req, res, next) {
  try {
    const { from, to } = dateRange(req.query);
    const rows = await Order.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(rows.map((r) => ({ status: r._id, count: r.count })));
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary, getSalesTrend, getTopProducts, getOrderStatusBreakdown };
