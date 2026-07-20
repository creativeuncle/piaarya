import axios from 'axios';

export async function fetchCoupons(params = {}) {
  const { data } = await axios.get('/api/coupons', { params });
  return data;
}

export async function fetchCoupon(id) {
  const { data } = await axios.get(`/api/coupons/${id}`);
  return data;
}

export async function createCoupon(payload) {
  const { data } = await axios.post('/api/coupons', payload);
  return data;
}

export async function updateCoupon(id, payload) {
  const { data } = await axios.put(`/api/coupons/${id}`, payload);
  return data;
}

export async function deleteCoupon(id) {
  const { data } = await axios.delete(`/api/coupons/${id}`);
  return data;
}

export async function fetchCouponAnalytics() {
  const { data } = await axios.get('/api/coupons/analytics');
  return data;
}
