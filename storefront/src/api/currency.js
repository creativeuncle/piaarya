import client from './client';

export async function fetchCurrencies() {
  const { data } = await client.get('/currency');
  return data;
}
