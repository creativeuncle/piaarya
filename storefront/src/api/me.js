import client from './client';

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export async function updateProfile(token, payload) {
  const { data } = await client.put('/me', payload, authHeaders(token));
  return data;
}

export async function fetchAddresses(token) {
  const { data } = await client.get('/me/addresses', authHeaders(token));
  return data;
}

export async function addAddress(token, payload) {
  const { data } = await client.post('/me/addresses', payload, authHeaders(token));
  return data;
}

export async function deleteAddress(token, index) {
  const { data } = await client.delete(`/me/addresses/${index}`, authHeaders(token));
  return data;
}

export async function fetchMyOrders(token) {
  const { data } = await client.get('/me/orders', authHeaders(token));
  return data;
}

export async function fetchMyRequests(token) {
  const { data } = await client.get('/me/requests', authHeaders(token));
  return data;
}
