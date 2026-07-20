import axios from 'axios';

export async function fetchCustomers(params = {}) {
  const { data } = await axios.get('/api/customers', { params });
  return data;
}

export async function fetchCustomer(id) {
  const { data } = await axios.get(`/api/customers/${id}`);
  return data;
}

export async function updateCustomer(id, payload) {
  const { data } = await axios.put(`/api/customers/${id}`, payload);
  return data;
}

export async function setCustomerBlocked(id, isBlocked) {
  const { data } = await axios.patch(`/api/customers/${id}/block`, { isBlocked });
  return data;
}

export async function fetchCustomerOrders(id) {
  const { data } = await axios.get(`/api/customers/${id}/orders`);
  return data;
}

export async function adjustRewardPoints(id, payload) {
  const { data } = await axios.post(`/api/customers/${id}/reward-points`, payload);
  return data;
}

export async function fetchCustomerActivity(id) {
  const { data } = await axios.get(`/api/customers/${id}/activity`);
  return data;
}
