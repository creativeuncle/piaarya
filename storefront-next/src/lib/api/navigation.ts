import client from './client';

export async function fetchNavigation() {
  const { data } = await client.get('/navigation');
  return data;
}
