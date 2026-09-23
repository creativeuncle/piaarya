import axios from 'axios';

export async function fetchSettings() {
  const { data } = await axios.get('/api/settings');
  return data;
}

export async function updateSettings(payload) {
  const { data } = await axios.put('/api/settings', payload);
  return data;
}

export async function fetchNotificationLogs() {
  const { data } = await axios.get('/api/settings/notifications/logs');
  return data;
}
