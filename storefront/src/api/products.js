import client from './client';

export async function fetchProducts(params = {}) {
  const { data } = await client.get('/products', { params });
  return data;
}

export async function fetchProduct(id) {
  const { data } = await client.get(`/products/${id}`);
  return data;
}

export async function fetchProductFacets() {
  const { data } = await client.get('/products/facets');
  return data;
}
