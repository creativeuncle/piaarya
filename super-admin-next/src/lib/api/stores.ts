import axios from 'axios';

export async function fetchStores() {
  const { data } = await axios.get('/api/platform/stores');
  return data;
}

export async function fetchStore(id: string) {
  const { data } = await axios.get(`/api/platform/stores/${id}`);
  return data;
}

export async function createStore(payload: {
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  plan?: string;
}) {
  const { data } = await axios.post('/api/platform/stores', payload);
  return data;
}

export async function fetchDashboard() {
  const { data } = await axios.get('/api/platform/dashboard');
  return data;
}
