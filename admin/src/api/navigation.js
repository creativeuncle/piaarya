import axios from 'axios';

export async function fetchNavigation() {
  const { data } = await axios.get('/api/navigation');
  return data;
}

export async function saveNavigation(menus) {
  const { data } = await axios.put('/api/navigation', { menus });
  return data;
}
