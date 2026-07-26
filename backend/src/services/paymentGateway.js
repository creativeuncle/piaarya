const Settings = require('../models/Settings');

const GATEWAYS = ['razorpay', 'stripe'];

async function getActiveGateway() {
  const settings = await Settings.findOne();
  return settings?.paymentGateway || 'razorpay';
}

// Simulated refund transfer. No Razorpay/Stripe API keys are configured in this
// project yet, so this stands in for the real gateway payout/refund call. Swap
// the body of this function for the chosen gateway's SDK call to go live —
// the rest of the return/refund flow does not need to change.
async function processRefund({ gateway, amount, destination }) {
  return {
    success: true,
    gateway,
    amount,
    destination,
    reference: `SIMULATED-${gateway.toUpperCase()}-${Date.now()}`,
    processedAt: new Date(),
  };
}

module.exports = { GATEWAYS, getActiveGateway, processRefund };
