const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');
const PaymentTransaction = require('../models/PaymentTransaction');
const { getActiveGateway, processRefund } = require('../services/paymentGateway');
const { triggerNotification } = require('../services/notificationService');

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
    const { order, items, type, reason, notes, refundMethod, refundDetails } = req.body;
    const returnRequest = await ReturnRequest.create({
      order,
      items,
      type,
      reason,
      notes,
      refundMethod: type === 'return' ? refundMethod : undefined,
      refundDetails: type === 'return' ? refundDetails : undefined,
      refundStatus: type === 'exchange' ? 'not_applicable' : 'pending',
    });

    const relatedOrder = await Order.findById(order).populate('customer', 'name email phone');
    if (relatedOrder?.customer) {
      triggerNotification(type === 'exchange' ? 'exchange_requested' : 'return_requested', {
        customer: relatedOrder.customer,
        order: relatedOrder,
        vars: { customerName: relatedOrder.customer.name, orderNumber: relatedOrder.orderNumber, amount: relatedOrder.totalAmount },
      });
    }

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

    const returnRequest = await ReturnRequest.findById(req.params.id);
    if (!returnRequest) return res.status(404).json({ message: 'Return request not found' });

    returnRequest.status = status;

    if (status === 'approved' && returnRequest.type === 'return' && returnRequest.refundStatus !== 'processed') {
      const order = await Order.findById(returnRequest.order).populate('customer', 'name email phone');
      if (!order) return res.status(404).json({ message: 'Order for this return was not found' });

      const refundAmount = returnRequest.items.reduce((sum, returnItem) => {
        const orderItem = order.items.find(
          (oi) =>
            String(oi.product) === String(returnItem.product) &&
            (oi.variantSku || '') === (returnItem.variantSku || '')
        );
        return sum + (orderItem ? orderItem.price * returnItem.quantity : 0);
      }, 0);

      let destination;
      if (returnRequest.refundMethod === 'upi') {
        destination = { method: 'upi', upiId: returnRequest.refundDetails?.upiId };
      } else if (returnRequest.refundMethod === 'bank') {
        destination = {
          method: 'bank',
          accountHolderName: returnRequest.refundDetails?.accountHolderName,
          accountNumber: returnRequest.refundDetails?.accountNumber,
          ifsc: returnRequest.refundDetails?.ifsc,
        };
      } else {
        destination = { method: 'original_payment_method' };
      }

      const gateway = order.paymentReference?.gateway || (await getActiveGateway());
      const result = await processRefund({ gateway, amount: refundAmount, destination, order });

      const priorRefunds = await PaymentTransaction.find({
        order: order._id,
        type: { $in: ['refund', 'partial_refund'] },
        status: 'success',
      });
      const alreadyRefunded = priorRefunds.reduce((sum, t) => sum + t.amount, 0);
      const isFullRefund = alreadyRefunded + refundAmount >= order.totalAmount;

      await PaymentTransaction.create({
        order: order._id,
        type: isFullRefund ? 'refund' : 'partial_refund',
        amount: refundAmount,
        status: 'success',
        method: gateway,
        reason: `Return approved (request ${returnRequest._id})`,
      });

      order.paymentStatus = isFullRefund ? 'refunded' : 'partially_refunded';
      await order.save();

      returnRequest.refundStatus = 'processed';
      returnRequest.refundResult = {
        gateway: result.gateway,
        reference: result.reference,
        amount: refundAmount,
        processedAt: result.processedAt,
        simulated: result.simulated,
      };

      triggerNotification('refund_processed', {
        customer: order.customer,
        order,
        vars: { customerName: order.customer?.name, orderNumber: order.orderNumber, amount: refundAmount },
      });
    }

    if (status === 'rejected' && returnRequest.refundStatus === 'pending') {
      returnRequest.refundStatus = 'not_applicable';
    }

    await returnRequest.save();
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
