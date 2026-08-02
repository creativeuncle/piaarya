import axios from 'axios';

export async function fetchAnalyticsSummary(params = {}) {
  const { data } = await axios.get('/api/analytics/summary', { params });
  return data;
}

export async function fetchSalesTrend(params = {}) {
  const { data } = await axios.get('/api/analytics/sales-trend', { params });
  return data;
}

export async function fetchTopProducts(params = {}) {
  const { data } = await axios.get('/api/analytics/top-products', { params });
  return data;
}

export async function fetchOrderStatusBreakdown(params = {}) {
  const { data } = await axios.get('/api/analytics/order-status', { params });
  return data;
}
