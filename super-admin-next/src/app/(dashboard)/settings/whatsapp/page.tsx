'use client';

import { useEffect, useState } from 'react';
import { fetchWhatsappSettings, updateWhatsappSettings } from '../../../../lib/api/whatsappSettings';

const EMPTY_FORM = {
  accessToken: '',
  accessTokenMasked: '',
  hasAccessToken: false,
  phoneNumberId: '',
  otpTemplateName: 'otp_login',
  otpTemplateLang: 'en_US',
  hasCopyCodeButton: true,
};

export default function PlatformWhatsappSettings() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function load() {
    fetchWhatsappSettings()
      .then((data) => {
        setForm({
          accessToken: '',
          accessTokenMasked: data.whatsapp.accessTokenMasked,
          hasAccessToken: data.whatsapp.hasAccessToken,
          phoneNumberId: data.whatsapp.phoneNumberId,
          otpTemplateName: data.whatsapp.otpTemplateName,
          otpTemplateLang: data.whatsapp.otpTemplateLang,
          hasCopyCodeButton: data.whatsapp.hasCopyCodeButton,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const data = await updateWhatsappSettings({
        whatsapp: {
          accessToken: form.accessToken,
          phoneNumberId: form.phoneNumberId,
          otpTemplateName: form.otpTemplateName,
          otpTemplateLang: form.otpTemplateLang,
          hasCopyCodeButton: form.hasCopyCodeButton,
        },
      });
      setForm({
        accessToken: '',
        accessTokenMasked: data.whatsapp.accessTokenMasked,
        hasAccessToken: data.whatsapp.hasAccessToken,
        phoneNumberId: data.whatsapp.phoneNumberId,
        otpTemplateName: data.whatsapp.otpTemplateName,
        otpTemplateLang: data.whatsapp.otpTemplateLang,
        hasCopyCodeButton: data.whatsapp.hasCopyCodeButton,
      });
      setMessage('Platform WhatsApp settings updated.');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Platform WhatsApp Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        CartDodo's own WhatsApp Business account — used to send "Login with WhatsApp" OTPs for every store on the
        platform, from one shared, "CartDodo"-branded WhatsApp Business number. A customer hasn't messaged first, so
        Meta requires a pre-approved Authentication template rather than a freeform message — set the template's
        exact name and language below, as approved in the Meta Business account (WhatsApp Manager → Message
        Templates).
      </p>

      {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
          <input
            className="input"
            type="password"
            value={form.accessToken}
            onChange={(e) => setField('accessToken', e.target.value)}
            placeholder={form.hasAccessToken ? form.accessTokenMasked : 'EAAxxxxxxxxxxxx'}
          />
          {form.hasAccessToken && (
            <p className="text-xs text-gray-400 mt-1">Currently saved: {form.accessTokenMasked}. Leave blank to keep it.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
          <input
            className="input"
            value={form.phoneNumberId}
            onChange={(e) => setField('phoneNumberId', e.target.value)}
            placeholder="1234567890"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OTP Template Name</label>
            <input
              className="input"
              value={form.otpTemplateName}
              onChange={(e) => setField('otpTemplateName', e.target.value)}
              placeholder="otp_login"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Language</label>
            <input
              className="input"
              value={form.otpTemplateLang}
              onChange={(e) => setField('otpTemplateLang', e.target.value)}
              placeholder="en_US"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.hasCopyCodeButton}
            onChange={(e) => setField('hasCopyCodeButton', e.target.checked)}
          />
          Template has a "Copy code" button
        </label>
        <p className="text-xs text-gray-400">
          Meta's default sample authentication templates include this button. Turn it off if the approved template
          has none — otherwise sends will fail.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
