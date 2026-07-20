const PaymentTransaction = require('../models/PaymentTransaction');
const Order = require('../models/Order');

async function listTransactions(req, res, next) {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (type && type !== 'all') filter.type = type;

    const transactions = await PaymentTransaction.find(filter)
      .populate({ path: 'order', select: 'orderNumber totalAmount paymentStatus customer', populate: { path: 'customer', select: 'name' } })
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

async function refundOrder(req, res, next) {
  try {
    const { amount, reason } = req.body;
    const refundAmount = Number(amount);
    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({ message: 'amount must be a positive number' });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const priorRefunds = await PaymentTransaction.find({
      order: order._id,
      type: { $in: ['refund', 'partial_refund'] },
      status: 'success',
    });
    const alreadyRefunded = priorRefunds.reduce((sum, t) => sum + t.amount, 0);
    const remaining = order.totalAmount - alreadyRefunded;

    if (refundAmount > remaining) {
      return res.status(400).json({ message: `Refund amount exceeds remaining refundable balance (₹${remaining})` });
    }

    const isFullRefund = refundAmount === remaining;
    const transaction = await PaymentTransaction.create({
      order: order._id,
      type: isFullRefund ? 'refund' : 'partial_refund',
      amount: refundAmount,
      status: 'success',
      reason,
    });

    order.paymentStatus = isFullRefund ? 'refunded' : 'partially_refunded';
    await order.save();

    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
}

module.exports = { listTransactions, refundOrder };
