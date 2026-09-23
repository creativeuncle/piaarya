import axios from 'axios';

export async function fetchTransactions(params = {}) {
  const { data } = await axios.get('/api/payments', { params });
  return data;
}

export async function refundOrder(orderId, payload) {
  const { data } = await axios.post(`/api/payments/${orderId}/refund`, payload);
  return data;
}
