import client from './client';

export async function subscribeNewsletter(email: string) {
  const { data } = await client.post('/newsletter/subscribe', { email });
  return data;
}

export async function submitContactForm(payload: { name: string; email: string; message: string }) {
  const { data } = await client.post('/contact', payload);
  return data;
}
