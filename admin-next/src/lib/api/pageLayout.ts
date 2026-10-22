import axios from 'axios';

export async function fetchPageLayout(page: string) {
  const { data } = await axios.get(`/api/page-layout/${page}`);
  return data;
}

export async function savePageLayout(page: string, sections: unknown[]) {
  const { data } = await axios.put(`/api/page-layout/${page}`, { sections });
  return data;
}
