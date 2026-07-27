import client from './client';

export async function fetchFeaturedReviews() {
  const { data } = await client.get('/reviews', { params: { status: 'approved', featured: 'true' } });
  return data;
}

export async function fetchProductReviews(productId, params = {}) {
  const { data } = await client.get('/reviews', { params: { status: 'approved', product: productId, ...params } });
  return data;
}

export async function fetchReviewTags() {
  const { data } = await client.get('/reviews/tags');
  return data;
}
