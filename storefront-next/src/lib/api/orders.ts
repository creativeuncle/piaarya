import client from './client';

export async function createOrder(payload) {
  const { data } = await client.post('/orders', { ...payload, clientOrigin: window.location.origin });
  return data;
}

export async function confirmStripeOrder(sessionId) {
  const { data } = await client.get(`/orders/stripe/confirm/${sessionId}`);
  return data;
}
