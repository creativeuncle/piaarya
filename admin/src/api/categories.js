import axios from 'axios';

export async function fetchCategories() {
  const { data } = await axios.get('/api/categories');
  return data;
}

export async function createCategory(payload) {
  const { data } = await axios.post('/api/categories', payload);
  return data;
}

export async function updateCategory(id, payload) {
  const { data } = await axios.put(`/api/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id) {
  const { data } = await axios.delete(`/api/categories/${id}`);
  return data;
}
