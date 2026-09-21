import client from './client';

export async function calculateShipping(state, subtotal) {
  const { data } = await client.post('/shipping/calculate', { state, subtotal });
  return data;
}
