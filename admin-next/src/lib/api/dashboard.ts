import axios from 'axios';

export async function fetchDashboardStats() {
  const { data } = await axios.get('/api/dashboard/stats');
  return data;
}
