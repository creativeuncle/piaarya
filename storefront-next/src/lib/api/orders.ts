import client from './client';

export async function createOrder(payload) {
  const { data } = await client.post('/orders', { ...payload, clientOrigin: window.location.origin });
  return data;
}

export async function confirmStripeOrder(sessionId) {
  const { data } = await client.get(`/orders/stripe/confirm/${sessionId}`);
  return data;
}

// Tells the storefront which online gateway (if any) is Active in
// Settings > Payments, so checkout can offer the right one without hardcoding Stripe.
export async function fetchPaymentConfig() {
  const { data } = await client.get('/orders/payment-config');
  return data;
}

export async function verifyRazorpayPayment(payload) {
  const { data } = await client.post('/orders/razorpay/verify', payload);
  return data;
}
