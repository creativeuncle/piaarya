'use client';

import { useEffect, useState } from 'react';
import { fetchPaymentSettings, updatePaymentSettings } from '../../../../lib/api/paymentSettings';

const EMPTY_FORM = {
  mode: 'test',
  keyId: '',
  keySecret: '',
  keySecretMasked: '',
  hasKeySecret: false,
  basicPrice: 0,
  superPrice: 0,
};

export default function PlatformPaymentSettings() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function load() {
    fetchPaymentSettings()
      .then((data) => {
        setForm({
          mode: data.razorpay.mode,
          keyId: data.razorpay.keyId,
          keySecret: '',
          keySecretMasked: data.razorpay.keySecretMasked,
          hasKeySecret: data.razorpay.hasKeySecret,
          basicPrice: data.planPricing?.basic || 0,
          superPrice: data.planPricing?.super || 0,
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
      const data = await updatePaymentSettings({
        razorpay: { mode: form.mode, keyId: form.keyId, keySecret: form.keySecret },
        planPricing: { basic: form.basicPrice, super: form.superPrice },
      });
      setForm({
        mode: data.razorpay.mode,
        keyId: data.razorpay.keyId,
        keySecret: '',
        keySecretMasked: data.razorpay.keySecretMasked,
        hasKeySecret: data.razorpay.hasKeySecret,
        basicPrice: data.planPricing?.basic || 0,
        superPrice: data.planPricing?.super || 0,
      });
      setMessage('Platform payment settings updated.');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Platform Payment Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        CartDodo's own Razorpay account — used to charge store owners for their Basic/Super plan subscription. This
        is separate from each store's own Razorpay keys (Settings → Payments inside their admin), which they use to
        charge their own customers.
      </p>

      {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
          <select className="input" value={form.mode} onChange={(e) => setField('mode', e.target.value)}>
            <option value="test">Test</option>
            <option value="live">Live</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Key ID</label>
          <input className="input" value={form.keyId} onChange={(e) => setField('keyId', e.target.value)} placeholder="rzp_live_..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Key Secret</label>
          <input
            className="input"
            type="password"
            value={form.keySecret}
            onChange={(e) => setField('keySecret', e.target.value)}
            placeholder={form.hasKeySecret ? form.keySecretMasked : 'Enter key secret'}
          />
          {form.hasKeySecret && <p className="text-xs text-gray-400 mt-1">Leave blank to keep the current secret.</p>}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-2">Plan Pricing</h2>
      <p className="text-sm text-gray-500 mb-4">
        Monthly price (in ₹) charged to a store on each plan — drives the amount shown on every store's own Settings
        → Billing page.
      </p>
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Basic plan (₹/month)</label>
          <input
            type="number"
            min="0"
            className="input"
            value={form.basicPrice}
            onChange={(e) => setField('basicPrice', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Super plan (₹/month)</label>
          <input
            type="number"
            min="0"
            className="input"
            value={form.superPrice}
            onChange={(e) => setField('superPrice', e.target.value)}
          />
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
