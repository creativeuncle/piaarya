import client from './client';

export async function signup(payload) {
  const { data } = await client.post('/auth/signup', payload);
  return data;
}

export async function login(payload) {
  const { data } = await client.post('/auth/login', payload);
  return data;
}

export async function fetchMe(token) {
  const { data } = await client.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  return data;
}

export async function forgotPassword(email) {
  const { data } = await client.post('/auth/forgot-password', { email });
  return data;
}

export async function requestOtp(phone) {
  const { data } = await client.post('/auth/otp/request', { phone });
  return data;
}

export async function verifyOtp(phone, otp) {
  const { data } = await client.post('/auth/otp/verify', { phone, otp });
  return data;
}
