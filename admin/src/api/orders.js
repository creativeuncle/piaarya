import axios from 'axios';

export async function fetchOrders(params = {}) {
  const { data } = await axios.get('/api/orders', { params });
  return data;
}

export async function fetchOrder(id) {
  const { data } = await axios.get(`/api/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data } = await axios.patch(`/api/orders/${id}/status`, { status });
  return data;
}

export async function fetchInvoice(id) {
  const { data } = await axios.get(`/api/orders/${id}/invoice`);
  return data;
}
