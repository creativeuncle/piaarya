import axios from 'axios';

export async function login(payload: { email: string; password: string }) {
  const { data } = await axios.post('/api/platform/login', payload);
  return data;
}

export async function fetchMe(token: string) {
  const { data } = await axios.get('/api/platform/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
