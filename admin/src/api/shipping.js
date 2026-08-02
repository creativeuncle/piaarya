import axios from 'axios';

export async function fetchShippingZones() {
  const { data } = await axios.get('/api/shipping/zones');
  return data;
}

export async function createShippingZone(payload) {
  const { data } = await axios.post('/api/shipping/zones', payload);
  return data;
}

export async function updateShippingZone(id, payload) {
  const { data } = await axios.put(`/api/shipping/zones/${id}`, payload);
  return data;
}

export async function deleteShippingZone(id) {
  const { data } = await axios.delete(`/api/shipping/zones/${id}`);
  return data;
}
