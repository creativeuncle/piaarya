import axios from 'axios';

export async function fetchCurrentCycle() {
  const { data } = await axios.get('/api/billing/current-cycle');
  return data;
}

export async function fetchBills(status?: string) {
  const { data } = await axios.get('/api/billing/bills', { params: status && status !== 'all' ? { status } : {} });
  return data;
}

export async function exportBills(status?: string) {
  const { data } = await axios.get('/api/billing/bills/export', {
    params: status && status !== 'all' ? { status } : {},
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'billing-history.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
