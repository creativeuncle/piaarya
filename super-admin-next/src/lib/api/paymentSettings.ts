import axios from 'axios';

export async function fetchPaymentSettings() {
  const { data } = await axios.get('/api/platform/payment-settings');
  return data;
}

export async function updatePaymentSettings(payload: {
  razorpay?: { mode?: string; keyId?: string; keySecret?: string };
  planPricing?: { basic?: number | string; super?: number | string };
}) {
  const { data } = await axios.put('/api/platform/payment-settings', payload);
  return data;
}
