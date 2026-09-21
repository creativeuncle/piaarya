import client from './client';

function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export async function fetchMyWishlist(token) {
  const { data } = await client.get('/wishlist/mine', authHeaders(token));
  return data;
}

export async function addToWishlist(token, productId) {
  const { data } = await client.post('/wishlist', { productId }, authHeaders(token));
  return data;
}

export async function removeFromWishlist(token, productId) {
  const { data } = await client.delete(`/wishlist/product/${productId}`, authHeaders(token));
  return data;
}
