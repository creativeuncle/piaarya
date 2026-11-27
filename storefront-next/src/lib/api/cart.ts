import client from './client';

export async function syncCart(token, items) {
  const { data } = await client.put('/cart/sync', { items }, { headers: { Authorization: `Bearer ${token}` } });
  return data;
}
