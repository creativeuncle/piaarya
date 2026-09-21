import client from './client';

export async function fetchPageBySlug(slug) {
  const { data } = await client.get(`/pages/slug/${slug}`);
  return data;
}
