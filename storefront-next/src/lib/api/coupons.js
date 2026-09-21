import client from './client';

export async function validateCoupon(code, subtotal) {
  const { data } = await client.post('/coupons/validate', { code, subtotal });
  return data;
}
