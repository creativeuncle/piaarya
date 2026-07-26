const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const PaymentTransaction = require('../models/PaymentTransaction');

async function listOrders(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name email')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone addresses')
      .populate('items.product', 'name sku media');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!Order.ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${Order.ORDER_STATUSES.join(', ')}` });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate(
      'customer',
      'name email'
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function getInvoice(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone addresses')
      .populate('items.product', 'name sku');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const { customer: customerInfo, shippingAddress, items, couponCode, paymentMethod } = req.body;

    if (!customerInfo?.email || !customerInfo?.name) {
      return res.status(400).json({ message: 'Customer name and email are required' });
    }
    if (!items?.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    if (paymentMethod !== 'cod') {
      return res.status(400).json({ message: 'Only Cash on Delivery is available right now' });
    }

    let customer = await Customer.findOne({ email: customerInfo.email.toLowerCase().trim() });
    if (!customer) {
      const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      customer = await Customer.create({
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        passwordHash,
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ message: `Product not found: ${item.productId}` });

      let price = product.price;
      const variant = item.variantSku ? product.variants.find((v) => v.sku === item.variantSku) : null;
      if (variant) price = variant.price;

      const quantity = Number(item.quantity) || 1;
      totalAmount += price * quantity;

      orderItems.push({ product: product._id, variantSku: item.variantSku || undefined, quantity, price });

      if (variant) variant.stock = Math.max(0, variant.stock - quantity);
      else product.stock = Math.max(0, product.stock - quantity);
      await product.save();
    }

    let discountAmount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
      if (coupon?.isActive) {
        const now = new Date();
        const withinWindow = (!coupon.startDate || now >= coupon.startDate) && (!coupon.endDate || now <= coupon.endDate);
        const underLimit = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;
        if (withinWindow && underLimit) {
          if (coupon.discountType === 'fixed') discountAmount = Math.min(coupon.discountValue || 0, totalAmount);
          else if (coupon.discountType === 'percentage') {
            discountAmount = Math.round((totalAmount * (coupon.discountValue || 0)) / 100);
          }
          appliedCoupon = coupon;
        }
      }
    }

    totalAmount = Math.max(totalAmount - discountAmount, 0);

    const order = await Order.create({
      orderNumber: `ORD-${Date.now()}`,
      customer: customer._id,
      items: orderItems,
      totalAmount,
      status: 'new',
      shippingAddress,
      paymentStatus: 'pending',
    });

    await PaymentTransaction.create({
      order: order._id,
      type: 'charge',
      amount: totalAmount,
      status: 'pending',
      method: paymentMethod,
    });

    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save();
    }

    res.status(201).json({ orderNumber: order.orderNumber, orderId: order._id, totalAmount });
  } catch (err) {
    next(err);
  }
}

module.exports = { listOrders, getOrder, createOrder, updateOrderStatus, getInvoice };
