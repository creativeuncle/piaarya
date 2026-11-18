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

export async function importProductsCsv(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await axios.post('/api/products/import-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function downloadImportTemplate() {
  const { data } = await axios.get('/api/products/import-template', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'products-import-template.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
