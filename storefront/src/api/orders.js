import client from './client';

export async function createOrder(payload) {
  const { data } = await client.post('/orders', payload);
  return data;
}
