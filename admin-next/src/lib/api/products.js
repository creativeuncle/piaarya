import axios from 'axios';

export async function fetchProducts(params = {}) {
  const { data } = await axios.get('/api/products', { params });
  return data;
}

export async function fetchProduct(id) {
  const { data } = await axios.get(`/api/products/${id}`);
  return data;
}

export async function createProduct(payload) {
  const { data } = await axios.post('/api/products', payload);
  return data;
}

export async function updateProduct(id, payload) {
  const { data } = await axios.put(`/api/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await axios.delete(`/api/products/${id}`);
  return data;
}
