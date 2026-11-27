const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const GiftCard = require('../models/GiftCard');
const StoreCreditLog = require('../models/StoreCreditLog');
const PaymentTransaction = require('../models/PaymentTransaction');
const {
  createStripeCheckoutSession,
  retrieveStripeSession,
  isStripeConfigured,
  createRazorpayOrder,
  isRazorpayConfigured,
  verifyRazorpaySignature,
  getActiveGateway,
} = require('../services/paymentGateway');
const { triggerNotification } = require('../services/notificationService');
const { getRatesForState } = require('../services/shippingService');
const { computeOrderTax } = require('../services/taxService');

const STATUS_EVENT_MAP = {
  processing: 'order_processing',
  delivered: 'order_delivered',
  cancelled: 'order_cancelled',
};

async function listOrders(req, res, next) {
  try {
    const { status, customer, product, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (customer) filter.customer = customer;
    if (product) filter['items.product'] = product;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(`${dateTo}T23:59:59.999Z`);
    }

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
      'name email phone'
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const eventKey = STATUS_EVENT_MAP[status];
    if (eventKey) {
      triggerNotification(eventKey, {
        customer: order.customer,
        order,
        vars: { customerName: order.customer?.name, orderNumber: order.orderNumber, amount: order.totalAmount },
      });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function updateOrderTracking(req, res, next) {
  try {
    const { carrier, trackingNumber, trackingUrl } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.shipping = { ...(order.shipping?.toObject?.() || order.shipping || {}), carrier, trackingNumber, trackingUrl };
    await order.save();
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

// Public — tells the storefront which online gateway (if any) to offer at
// checkout, following whichever one is set Active in Settings > Payments,
// without exposing any secret keys.
async function getPaymentConfig(req, res, next) {
  try {
    const gateway = await getActiveGateway();
    const configured = gateway === 'stripe' ? await isStripeConfigured() : await isRazorpayConfigured();
    res.json({ gateway, configured });
  } catch (err) {
    next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const { customer: customerInfo, shippingAddress, items, couponCode, paymentMethod, shippingRateLabel, giftCardCode, useStoreCredit } = req.body;

    if (!customerInfo?.email || !customerInfo?.name) {
      return res.status(400).json({ message: 'Customer name and email are required' });
    }
    if (!items?.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    if (!['cod', 'stripe', 'razorpay'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Payment method must be cod, stripe or razorpay' });
    }
    if (paymentMethod === 'stripe' && !(await isStripeConfigured())) {
      return res.status(400).json({ message: 'Stripe is not configured yet. Add a Stripe secret key in Settings > Payments.' });
    }
    if (paymentMethod === 'razorpay' && !(await isRazorpayConfigured())) {
      return res.status(400).json({ message: 'Razorpay is not configured yet. Add a Razorpay key in Settings > Payments.' });
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
    const orderItemNames = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ message: `Product not found: ${item.productId}` });

      let price = product.price;
      const variant = item.variantSku ? product.variants.find((v) => v.sku === item.variantSku) : null;
      if (variant) price = variant.price;

      const quantity = Number(item.quantity) || 1;
      totalAmount += price * quantity;

      orderItems.push({
        product: product._id,
        variantSku: item.variantSku || undefined,
        quantity,
        price,
        gstRate: product.gstRate,
        hsnCode: product.hsnCode,
      });
      orderItemNames.push(product.name);

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

    const { zoneName, rates } = await getRatesForState(shippingAddress?.state, totalAmount);
    const matchedRate = rates.find((r) => r.label === shippingRateLabel) || rates[0] || null;
    const shippingCost = matchedRate?.price || 0;
    totalAmount += shippingCost;

    const taxBreakup = await computeOrderTax(orderItems, shippingAddress?.state);
    if (taxBreakup.taxType && taxBreakup.pricesIncludeTax === false) {
      totalAmount += taxBreakup.totalTax;
    }

    let giftCardUsed = null;
    if (giftCardCode) {
      const giftCard = await GiftCard.findOne({ code: String(giftCardCode).toUpperCase().trim() });
      const isValid =
        giftCard && giftCard.isActive && giftCard.balance > 0 && (!giftCard.expiresAt || new Date() <= giftCard.expiresAt);
      if (isValid) {
        const amountToUse = Math.min(giftCard.balance, totalAmount);
        if (amountToUse > 0) {
          giftCard.balance -= amountToUse;
          if (giftCard.balance <= 0) giftCard.isActive = false;
          await giftCard.save();
          totalAmount -= amountToUse;
          giftCardUsed = { code: giftCard.code, amountUsed: amountToUse };
        }
      }
    }

    let storeCreditUsed = 0;
    if (useStoreCredit && customer.storeCredit > 0 && totalAmount > 0) {
      storeCreditUsed = Math.min(customer.storeCredit, totalAmount);
      const previousValue = customer.storeCredit;
      customer.storeCredit -= storeCreditUsed;
      await customer.save();
      await StoreCreditLog.create({
        customer: customer._id,
        amountChange: -storeCreditUsed,
        previousValue,
        newValue: customer.storeCredit,
        reason: 'Applied at checkout',
      });
      totalAmount -= storeCreditUsed;
    }

    const coveredByCredits = totalAmount <= 0;

    const order = await Order.create({
      orderNumber: `ORD-${Date.now()}`,
      customer: customer._id,
      items: orderItems,
      totalAmount,
      status: ['stripe', 'razorpay'].includes(paymentMethod) && !coveredByCredits ? 'pending' : 'new',
      shippingAddress,
      paymentStatus: coveredByCredits ? 'paid' : 'pending',
      paymentMethod,
      shipping: matchedRate
        ? { zoneName, rateLabel: matchedRate.label, cost: shippingCost }
        : undefined,
      taxBreakup: taxBreakup.taxType
        ? {
            taxableAmount: taxBreakup.taxableAmount,
            cgst: taxBreakup.cgst,
            sgst: taxBreakup.sgst,
            igst: taxBreakup.igst,
            totalTax: taxBreakup.totalTax,
            taxType: taxBreakup.taxType,
          }
        : undefined,
      giftCard: giftCardUsed || undefined,
      storeCreditUsed: storeCreditUsed || undefined,
    });

    // This customer just checked out, so any synced cart of theirs is no
    // longer "abandoned" — mark it converted so it drops off the recovery list.
    await Cart.findOneAndUpdate(
      { customer: customer._id, status: { $in: ['active', 'abandoned'] } },
      { status: 'converted' }
    );

    await PaymentTransaction.create({
      order: order._id,
      type: 'charge',
      amount: totalAmount,
      status: coveredByCredits ? 'success' : 'pending',
      method: coveredByCredits ? 'gift_card_store_credit' : paymentMethod,
    });

    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save();
    }

    if (paymentMethod === 'stripe' && !coveredByCredits) {
      const { clientOrigin } = req.body;
      const origin = clientOrigin || process.env.CLIENT_URL || 'http://localhost:5174';

      const orderObj = order.toObject();
      const session = await createStripeCheckoutSession({
        order: { ...orderObj, items: orderObj.items.map((oi, idx) => ({ ...oi, name: orderItemNames[idx] })) },
        successUrl: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/checkout`,
      });

      order.paymentReference = {
        gateway: 'stripe',
        checkoutSessionId: session.id,
        paymentIntentId: session.payment_intent,
      };
      await order.save();

      return res.status(201).json({ orderNumber: order.orderNumber, orderId: order._id, totalAmount, checkoutUrl: session.url });
    }

    if (paymentMethod === 'razorpay' && !coveredByCredits) {
      const rzpOrder = await createRazorpayOrder({ amount: totalAmount, receipt: order.orderNumber });

      order.paymentReference = { gateway: 'razorpay', razorpayOrderId: rzpOrder.id };
      await order.save();

      return res.status(201).json({
        orderNumber: order.orderNumber,
        orderId: order._id,
        totalAmount,
        razorpay: { orderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, keyId: rzpOrder.keyId },
      });
    }

    triggerNotification('order_placed', {
      customer,
      order,
      vars: { customerName: customer.name, orderNumber: order.orderNumber, amount: totalAmount },
    });

    res.status(201).json({ orderNumber: order.orderNumber, orderId: order._id, totalAmount });
  } catch (err) {
    next(err);
  }
}

async function confirmStripeOrder(req, res, next) {
  try {
    const { sessionId } = req.params;
    const session = await retrieveStripeSession(sessionId);

    const order = await Order.findOne({ 'paymentReference.checkoutSessionId': sessionId }).populate(
      'customer',
      'name email phone'
    );
    if (!order) return res.status(404).json({ message: 'Order not found for this Stripe session' });

    if (session.payment_status !== 'paid') {
      return res.json({ status: 'pending', orderNumber: order.orderNumber, totalAmount: order.totalAmount });
    }

    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paymentReference.paymentIntentId = session.payment_intent;
      await order.save();

      await PaymentTransaction.findOneAndUpdate(
        { order: order._id, type: 'charge', status: 'pending' },
        { status: 'success' }
      );

      triggerNotification('order_placed', {
        customer: order.customer,
        order,
        vars: { customerName: order.customer?.name, orderNumber: order.orderNumber, amount: order.totalAmount },
      });
    }

    res.json({ status: 'paid', orderNumber: order.orderNumber, totalAmount: order.totalAmount });
  } catch (err) {
    next(err);
  }
}

// Called by the storefront right after Razorpay's Checkout widget reports a
// successful payment. The signature is the only proof this response really
// came from Razorpay and wasn't forged in the browser — the widget itself
// never confirms the charge actually went through.
async function verifyRazorpayPayment(req, res, next) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Missing Razorpay payment details' });
    }

    const valid = await verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
    if (!valid) return res.status(400).json({ message: 'Payment verification failed' });

    const order = await Order.findOne({ 'paymentReference.razorpayOrderId': razorpayOrderId }).populate(
      'customer',
      'name email phone'
    );
    if (!order) return res.status(404).json({ message: 'Order not found for this Razorpay order' });

    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paymentReference.razorpayPaymentId = razorpayPaymentId;
      await order.save();

      await PaymentTransaction.findOneAndUpdate(
        { order: order._id, type: 'charge', status: 'pending' },
        { status: 'success' }
      );

      triggerNotification('order_placed', {
        customer: order.customer,
        order,
        vars: { customerName: order.customer?.name, orderNumber: order.orderNumber, amount: order.totalAmount },
      });
    }

    res.json({ status: 'paid', orderNumber: order.orderNumber, totalAmount: order.totalAmount });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updateOrderTracking,
  getInvoice,
  confirmStripeOrder,
  verifyRazorpayPayment,
  getPaymentConfig,
};
