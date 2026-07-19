import axios from 'axios';

export async function fetchCategories() {
  const { data } = await axios.get('/api/categories');
  return data;
}

export async function createCategory(payload) {
  const { data } = await axios.post('/api/categories', payload);
  return data;
}
