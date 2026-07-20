const Customer = require('../models/Customer');
const Order = require('../models/Order');
const RewardPointsLog = require('../models/RewardPointsLog');

async function listCustomers(req, res, next) {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(filter).sort({ createdAt: -1 }).lean();
    const orderCounts = await Order.aggregate([{ $group: { _id: '$customer', count: { $sum: 1 } } }]);
    const countByCustomer = new Map(orderCounts.map((o) => [String(o._id), o.count]));

    res.json(
      customers.map((c) => ({ ...c, ordersCount: countByCustomer.get(String(c._id)) || 0 }))
    );
  } catch (err) {
    next(err);
  }
}

async function getCustomer(req, res, next) {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const { name, phone, addresses } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, addresses },
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
}

async function setBlocked(req, res, next) {
  try {
    const { isBlocked } = req.body;
    const customer = await Customer.findByIdAndUpdate(req.params.id, { isBlocked }, { new: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
}

async function getCustomerOrders(req, res, next) {
  try {
    const orders = await Order.find({ customer: req.params.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function adjustRewardPoints(req, res, next) {
  try {
    const pointsChange = Number(req.body.delta);
    if (!pointsChange) return res.status(400).json({ message: 'delta must be a non-zero number' });

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const previousValue = customer.rewardPoints || 0;
    const newValue = Math.max(0, previousValue + pointsChange);
    customer.rewardPoints = newValue;
    await customer.save();

    await RewardPointsLog.create({
      customer: customer._id,
      pointsChange,
      previousValue,
      newValue,
      reason: req.body.reason,
    });

    res.json(customer);
  } catch (err) {
    next(err);
  }
}

async function getActivity(req, res, next) {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const [orders, rewardLogs] = await Promise.all([
      Order.find({ customer: req.params.id }).sort({ createdAt: -1 }),
      RewardPointsLog.find({ customer: req.params.id }).sort({ createdAt: -1 }),
    ]);

    const events = [
      { type: 'account_created', createdAt: customer.createdAt, description: 'Account created' },
      ...orders.map((o) => ({
        type: 'order',
        createdAt: o.createdAt,
        description: `Placed order ${o.orderNumber} (₹${o.totalAmount})`,
      })),
      ...rewardLogs.map((r) => ({
        type: 'reward_points',
        createdAt: r.createdAt,
        description: `Reward points ${r.pointsChange > 0 ? '+' : ''}${r.pointsChange}${r.reason ? ` (${r.reason})` : ''}`,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(events);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCustomers,
  getCustomer,
  updateCustomer,
  setBlocked,
  getCustomerOrders,
  adjustRewardPoints,
  getActivity,
};
