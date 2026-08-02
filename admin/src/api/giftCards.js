import axios from 'axios';

export async function fetchGiftCards(params = {}) {
  const { data } = await axios.get('/api/gift-cards', { params });
  return data;
}

export async function createGiftCard(payload) {
  const { data } = await axios.post('/api/gift-cards', payload);
  return data;
}

export async function toggleGiftCard(id, isActive) {
  const { data } = await axios.put(`/api/gift-cards/${id}/toggle`, { isActive });
  return data;
}

export async function deleteGiftCard(id) {
  const { data } = await axios.delete(`/api/gift-cards/${id}`);
  return data;
}
