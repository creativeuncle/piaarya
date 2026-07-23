import client from './client';

export async function fetchProducts(params = {}) {
  const { data } = await client.get('/products', { params });
  return data;
}
