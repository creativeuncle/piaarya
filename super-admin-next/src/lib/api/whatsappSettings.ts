import axios from 'axios';

export async function fetchWhatsappSettings() {
  const { data } = await axios.get('/api/platform/whatsapp-settings');
  return data;
}

export async function updateWhatsappSettings(payload: {
  whatsapp: {
    accessToken?: string;
    phoneNumberId?: string;
    otpTemplateName?: string;
    otpTemplateLang?: string;
    hasCopyCodeButton?: boolean;
  };
}) {
  const { data } = await axios.put('/api/platform/whatsapp-settings', payload);
  return data;
}
