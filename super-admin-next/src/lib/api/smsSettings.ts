import axios from 'axios';

export async function fetchSmsSettings() {
  const { data } = await axios.get('/api/platform/sms-settings');
  return data;
}

export async function updateSmsSettings(payload: { sms: { fast2smsApiKey?: string } }) {
  const { data } = await axios.put('/api/platform/sms-settings', payload);
  return data;
}
