import client from './client';

export async function validateGiftCard(code) {
  const { data } = await client.post('/gift-cards/validate', { code });
  return data;
}
