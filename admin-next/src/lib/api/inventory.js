import axios from 'axios';

export async function fetchInventory(params = {}) {
  const { data } = await axios.get('/api/inventory', { params });
  return data;
}

export async function adjustInventory(productId, payload) {
  const { data } = await axios.post(`/api/inventory/${productId}/adjust`, payload);
  return data;
}

export async function fetchInventoryHistory(productId) {
  const { data } = await axios.get(`/api/inventory/${productId}/history`);
  return data;
}

export async function fetchWarehouses() {
  const { data } = await axios.get('/api/warehouses');
  return data;
}

export async function createWarehouse(payload) {
  const { data } = await axios.post('/api/warehouses', payload);
  return data;
}
