import axios from 'axios';

export async function fetchReturns(params = {}) {
  const { data } = await axios.get('/api/returns', { params });
  return data;
}

export async function fetchReturnReasons() {
  const { data } = await axios.get('/api/returns/reasons');
  return data;
}

export async function createReturn(payload) {
  const { data } = await axios.post('/api/returns', payload);
  return data;
}

export async function setReturnStatus(id, status) {
  const { data } = await axios.patch(`/api/returns/${id}/status`, { status });
  return data;
}

export async function setPickupStatus(id, pickupStatus) {
  const { data } = await axios.patch(`/api/returns/${id}/pickup-status`, { pickupStatus });
  return data;
}

export async function setRefundStatus(id, refundStatus) {
  const { data } = await axios.patch(`/api/returns/${id}/refund-status`, { refundStatus });
  return data;
}
