import client from './client';

export async function fetchFeaturedReviews() {
  const { data } = await client.get('/reviews', { params: { status: 'approved', featured: 'true' } });
  return data;
}
