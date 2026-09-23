import axios from 'axios';

export async function fetchReviews(params = {}) {
  const { data } = await axios.get('/api/reviews', { params });
  return data;
}

export async function setReviewStatus(id, status) {
  const { data } = await axios.patch(`/api/reviews/${id}/status`, { status });
  return data;
}

export async function setReviewReply(id, reply) {
  const { data } = await axios.patch(`/api/reviews/${id}/reply`, { reply });
  return data;
}

export async function setReviewFeatured(id, isFeatured) {
  const { data } = await axios.patch(`/api/reviews/${id}/featured`, { isFeatured });
  return data;
}
