'use client';

import { useEffect, useState } from 'react';
import { fetchSmsSettings, updateSmsSettings } from '../../../../lib/api/smsSettings';

const EMPTY_FORM = {
  fast2smsApiKey: '',
  fast2smsApiKeyMasked: '',
  hasFast2smsApiKey: false,
};

export default function PlatformSmsSettings() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function load() {
    fetchSmsSettings()
      .then((data) => {
        setForm({
          fast2smsApiKey: '',
          fast2smsApiKeyMasked: data.sms.fast2smsApiKeyMasked,
          hasFast2smsApiKey: data.sms.hasFast2smsApiKey,
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
      const data = await updateSmsSettings({ sms: { fast2smsApiKey: form.fast2smsApiKey } });
      setForm({
        fast2smsApiKey: '',
        fast2smsApiKeyMasked: data.sms.fast2smsApiKeyMasked,
        hasFast2smsApiKey: data.sms.hasFast2smsApiKey,
      });
      setMessage('Platform SMS settings updated.');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Platform SMS Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        CartDodo's own Fast2SMS account — used to send order/return SMS updates for every store on the platform.
        (Login OTP now goes out over WhatsApp instead — see Settings → WhatsApp Settings.) Unlike Razorpay, this
        isn't money flowing to a store owner's own account, so one key here covers all stores instead of each
        owner needing their own Fast2SMS account. Get your API key from Fast2SMS → Dev API.
      </p>

      {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fast2SMS API Key</label>
          <input
            className="input"
            type="password"
            value={form.fast2smsApiKey}
            onChange={(e) => setField('fast2smsApiKey', e.target.value)}
            placeholder={form.hasFast2smsApiKey ? form.fast2smsApiKeyMasked : 'Enter API key'}
          />
          {form.hasFast2smsApiKey && (
            <p className="text-xs text-gray-400 mt-1">Currently saved: {form.fast2smsApiKeyMasked}. Leave blank to keep it.</p>
          )}
        </div>
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
