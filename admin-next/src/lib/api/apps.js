import axios from 'axios';

export async function fetchApps() {
  const { data } = await axios.get('/api/apps');
  return data;
}

export async function installApp(key) {
  const { data } = await axios.post(`/api/apps/${key}/install`);
  return data;
}

export async function toggleApp(key, isEnabled) {
  const { data } = await axios.put(`/api/apps/${key}/toggle`, { isEnabled });
  return data;
}

export async function uninstallApp(key) {
  const { data } = await axios.delete(`/api/apps/${key}`);
  return data;
}
