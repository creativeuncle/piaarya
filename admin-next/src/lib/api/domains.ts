import axios from 'axios';

export async function fetchDomains() {
  const { data } = await axios.get('/api/domains');
  return data;
}

export async function connectDomain(domain: string) {
  const { data } = await axios.post('/api/domains', { domain });
  return data;
}

export async function verifyDomain(id: string) {
  const { data } = await axios.post(`/api/domains/${id}/verify`);
  return data;
}

export async function makePrimaryDomain(id: string) {
  const { data } = await axios.post(`/api/domains/${id}/make-primary`);
  return data;
}

export async function removeDomain(id: string) {
  const { data } = await axios.delete(`/api/domains/${id}`);
  return data;
}
