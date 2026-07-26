import axios from 'axios';

export async function fetchWishlist(params = {}) {
  const { data } = await axios.get('/api/wishlist', { params });
  return data;
}

export async function fetchPopularWishlistProducts() {
  const { data } = await axios.get('/api/wishlist/popular');
  return data;
}

export async function removeWishlistEntry(id) {
  const { data } = await axios.delete(`/api/wishlist/${id}`);
  return data;
}
