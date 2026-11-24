import axios from 'axios';

export async function fetchGeneralSettings() {
  const { data } = await axios.get('/api/store/general');
  return data;
}

export async function updateGeneralSettings(payload) {
  const { data } = await axios.put('/api/store/general', payload);
  return data;
}
