import client from './client';

export async function fetchReturnReasons() {
  const { data } = await client.get('/returns/reasons');
  return data;
}

export async function createReturnRequest(payload) {
  const { data } = await client.post('/returns', payload);
  return data;
}
