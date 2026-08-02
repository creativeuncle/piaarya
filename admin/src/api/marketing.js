import axios from 'axios';

export async function fetchAbandonedCarts() {
  const { data } = await axios.get('/api/marketing/abandoned-carts');
  return data;
}

export async function sendRecoveryEmail(cartId) {
  const { data } = await axios.post(`/api/marketing/abandoned-carts/${cartId}/send-recovery`);
  return data;
}

export async function setCartStatus(cartId, status) {
  const { data } = await axios.patch(`/api/marketing/abandoned-carts/${cartId}/status`, { status });
  return data;
}

export async function fetchCampaigns() {
  const { data } = await axios.get('/api/marketing/campaigns');
  return data;
}

export async function fetchCampaignSegments() {
  const { data } = await axios.get('/api/marketing/campaigns/segments');
  return data;
}

export async function createCampaign(payload) {
  const { data } = await axios.post('/api/marketing/campaigns', payload);
  return data;
}

export async function deleteCampaign(id) {
  const { data } = await axios.delete(`/api/marketing/campaigns/${id}`);
  return data;
}

export async function sendCampaign(id) {
  const { data } = await axios.post(`/api/marketing/campaigns/${id}/send`);
  return data;
}

export async function fetchWhatsAppCampaigns() {
  const { data } = await axios.get('/api/marketing/whatsapp-campaigns');
  return data;
}

export async function fetchWhatsAppCampaignSegments() {
  const { data } = await axios.get('/api/marketing/whatsapp-campaigns/segments');
  return data;
}

export async function createWhatsAppCampaign(payload) {
  const { data } = await axios.post('/api/marketing/whatsapp-campaigns', payload);
  return data;
}

export async function deleteWhatsAppCampaign(id) {
  const { data } = await axios.delete(`/api/marketing/whatsapp-campaigns/${id}`);
  return data;
}

export async function sendWhatsAppCampaign(id) {
  const { data } = await axios.post(`/api/marketing/whatsapp-campaigns/${id}/send`);
  return data;
}
