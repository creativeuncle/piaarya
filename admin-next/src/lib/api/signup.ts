import axios from 'axios';

export async function checkSlug(slug: string) {
  const { data } = await axios.get('/api/signup/check-slug', { params: { slug } });
  return data;
}

export async function signup(payload) {
  const { data } = await axios.post('/api/signup', payload);
  return data;
}
