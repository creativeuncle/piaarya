import axios from 'axios';

export async function fetchPages(params = {}) {
  const { data } = await axios.get('/api/pages', { params });
  return data;
}

export async function fetchPage(id) {
  const { data } = await axios.get(`/api/pages/${id}`);
  return data;
}

export async function createPage(payload) {
  const { data } = await axios.post('/api/pages', payload);
  return data;
}

export async function updatePage(id, payload) {
  const { data } = await axios.put(`/api/pages/${id}`, payload);
  return data;
}

export async function deletePage(id) {
  const { data } = await axios.delete(`/api/pages/${id}`);
  return data;
}
