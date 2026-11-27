const crypto = require('crypto');
const Razorpay = require('razorpay');
const Stripe = require('stripe');
const Settings = require('../models/Settings');

const GATEWAYS = ['razorpay', 'stripe'];

async function getSettingsDoc() {
  return (await Settings.findOne()) || {};
}

async function getActiveGateway() {
  const settings = await getSettingsDoc();
  return settings.paymentGateway || 'razorpay';
}

async function getRazorpayCredentials() {
  const settings = await getSettingsDoc();
  return { keyId: settings.razorpay?.keyId, keySecret: settings.razorpay?.keySecret };
}

async function getRazorpayClient() {
  const { keyId, keySecret } = await getRazorpayCredentials();
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

async function isRazorpayConfigured() {
  return Boolean((await getRazorpayClient()) !== null);
}

// Creates a Razorpay Order — the first step of Razorpay's checkout flow.
// The returned order id + amount + the (public) key id go to the storefront,
// which opens Razorpay's Checkout widget with them.
async function createRazorpayOrder({ amount, receipt }) {
  const razorpay = await getRazorpayClient();
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Add a Razorpay key in Settings > Payments.');
  }
  const { keyId } = await getRazorpayCredentials();
  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt,
  });
  return { ...rzpOrder, keyId };
}

// Verifies the HMAC-SHA256 signature Razorpay's Checkout widget returns on
// success — this is what proves the payment response actually came from
// Razorpay and wasn't forged by the browser.
async function verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const { keySecret } = await getRazorpayCredentials();
  if (!keySecret) return false;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  return expected === razorpaySignature;
}

async function getStripeClient() {
  const settings = await getSettingsDoc();
  const secretKey = settings.stripe?.secretKey;
  if (!secretKey) return null;
  return new Stripe(secretKey);
}

async function isStripeConfigured() {
  return Boolean((await getStripeClient()) !== null);
}

async function createStripeCheckoutSession({ order, successUrl, cancelUrl }) {
  const stripe = await getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not configured. Add a Stripe secret key in Settings > Payments.');
  }

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: 'inr',
      product_data: { name: item.name || 'Product' },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  if (order.shipping?.cost > 0) {
    lineItems.push({
      price_data: {
        currency: 'inr',
        product_data: { name: order.shipping.rateLabel || 'Shipping' },
        unit_amount: Math.round(order.shipping.cost * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { orderId: String(order._id) },
  });

  return session;
}

async function retrieveStripeSession(sessionId) {
  const stripe = await getStripeClient();
  if (!stripe) throw new Error('Stripe is not configured.');
  return stripe.checkout.sessions.retrieve(sessionId);
}

// Refunds a return request's amount. When the customer chose "Original Payment
// Method" on a Stripe-paid order and a Stripe secret key is configured, this
// issues a real test/live refund via the Stripe API. Everything else (UPI,
// Bank Account, or Stripe without a configured key) is recorded as a clearly
// labeled simulated transfer, since there is no real bank/UPI payout API
// connected — swap this function's body to add one later.
async function processRefund({ gateway, amount, destination, order }) {
  if (gateway === 'stripe' && destination?.method === 'original_payment_method' && order?.paymentReference?.paymentIntentId) {
    const stripe = await getStripeClient();
    if (stripe) {
      const refund = await stripe.refunds.create({
        payment_intent: order.paymentReference.paymentIntentId,
        amount: Math.round(amount * 100),
      });
      return {
        success: true,
        gateway: 'stripe',
        amount,
        destination,
        reference: refund.id,
        processedAt: new Date(),
        simulated: false,
      };
    }
  }

  if (gateway === 'razorpay' && destination?.method === 'original_payment_method' && order?.paymentReference?.razorpayPaymentId) {
    const razorpay = await getRazorpayClient();
    if (razorpay) {
      const refund = await razorpay.payments.refund(order.paymentReference.razorpayPaymentId, {
        amount: Math.round(amount * 100),
      });
      return {
        success: true,
        gateway: 'razorpay',
        amount,
        destination,
        reference: refund.id,
        processedAt: new Date(),
        simulated: false,
      };
    }
  }

  return {
    success: true,
    gateway,
    amount,
    destination,
    reference: `SIMULATED-${gateway.toUpperCase()}-${Date.now()}`,
    processedAt: new Date(),
    simulated: true,
  };
}

module.exports = {
  GATEWAYS,
  getActiveGateway,
  getStripeClient,
  isStripeConfigured,
  createStripeCheckoutSession,
  retrieveStripeSession,
  isRazorpayConfigured,
  createRazorpayOrder,
  verifyRazorpaySignature,
  processRefund,
};
