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
  processRefund,
};
