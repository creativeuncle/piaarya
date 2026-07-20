const ReturnRequest = require('../models/ReturnRequest');

async function listReturns(req, res, next) {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (type && type !== 'all') filter.type = type;

    const returns = await ReturnRequest.find(filter)
      .populate({ path: 'order', select: 'orderNumber customer totalAmount', populate: { path: 'customer', select: 'name' } })
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (err) {
    next(err);
  }
}

async function createReturn(req, res, next) {
  try {
    const { order, items, type, reason, notes } = req.body;
    const returnRequest = await ReturnRequest.create({
      order,
      items,
      type,
      reason,
      notes,
      refundStatus: type === 'exchange' ? 'not_applicable' : 'pending',
    });
    res.status(201).json(returnRequest);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['requested', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const returnRequest = await ReturnRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!returnRequest) return res.status(404).json({ message: 'Return request not found' });
    res.json(returnRequest);
  } catch (err) {
    next(err);
  }
}

async function updatePickupStatus(req, res, next) {
  try {
    const { pickupStatus } = req.body;
    const returnRequest = await ReturnRequest.findByIdAndUpdate(req.params.id, { pickupStatus }, { new: true });
    if (!returnRequest) return res.status(404).json({ message: 'Return request not found' });
    res.json(returnRequest);
  } catch (err) {
    next(err);
  }
}

async function updateRefundStatus(req, res, next) {
  try {
    const { refundStatus } = req.body;
    const returnRequest = await ReturnRequest.findByIdAndUpdate(req.params.id, { refundStatus }, { new: true });
    if (!returnRequest) return res.status(404).json({ message: 'Return request not found' });
    res.json(returnRequest);
  } catch (err) {
    next(err);
  }
}

module.exports = { listReturns, createReturn, updateStatus, updatePickupStatus, updateRefundStatus };
