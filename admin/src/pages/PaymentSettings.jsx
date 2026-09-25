import { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '../api/settings';

const GATEWAYS = [
  { key: 'razorpay', label: 'Razorpay' },
  { key: 'stripe', label: 'Stripe' },
];

const EMPTY_FORM = {
  razorpayMode: 'test',
  razorpayKeyId: '',
  razorpayKeySecret: '',
  razorpayKeySecretMasked: '',
  razorpayHasKeySecret: false,
  stripeMode: 'test',
  stripePublishableKey: '',
  stripeSecretKey: '',
  stripeSecretKeyMasked: '',
  stripeHasSecretKey: false,
};

export default function PaymentSettings() {
  const [paymentGateway, setPaymentGateway] = useState('razorpay');
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function load() {
    fetchSettings()
      .then((data) => {
        setPaymentGateway(data.paymentGateway);
        setForm({
          razorpayMode: data.razorpay.mode,
          razorpayKeyId: data.razorpay.keyId,
          razorpayKeySecret: '',
          razorpayKeySecretMasked: data.razorpay.keySecretMasked,
          razorpayHasKeySecret: data.razorpay.hasKeySecret,
          stripeMode: data.stripe.mode,
          stripePublishableKey: data.stripe.publishableKey,
          stripeSecretKey: '',
          stripeSecretKeyMasked: data.stripe.secretKeyMasked,
          stripeHasSecretKey: data.stripe.hasSecretKey,
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
      const data = await updateSettings({
        paymentGateway,
        razorpay: {
          mode: form.razorpayMode,
          keyId: form.razorpayKeyId,
          keySecret: form.razorpayKeySecret,
        },
        stripe: {
          mode: form.stripeMode,
          publishableKey: form.stripePublishableKey,
          secretKey: form.stripeSecretKey,
        },
      });
      setPaymentGateway(data.paymentGateway);
      setForm({
        razorpayMode: data.razorpay.mode,
        razorpayKeyId: data.razorpay.keyId,
        razorpayKeySecret: '',
        razorpayKeySecretMasked: data.razorpay.keySecretMasked,
        razorpayHasKeySecret: data.razorpay.hasKeySecret,
        stripeMode: data.stripe.mode,
        stripePublishableKey: data.stripe.publishableKey,
        stripeSecretKey: '',
        stripeSecretKeyMasked: data.stripe.secretKeyMasked,
        stripeHasSecretKey: data.stripe.hasSecretKey,
      });
      setMessage('Payment settings updated.');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Payment Gateway</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-2xl">
        Add your Razorpay or Stripe API keys (test or live mode) and choose which gateway is active. Refunds for
        approved returns process through the active gateway. Stripe refunds to a customer's original payment method
        require a Stripe secret key here and an order actually paid via Stripe checkout.
      </p>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 max-w-2xl">
        <p className="text-sm font-medium text-gray-700 mb-2">Active Gateway</p>
        <div className="flex gap-3 mb-6">
          {GATEWAYS.map((gw) => (
            <label
              key={gw.key}
              className={`flex items-center gap-2 border rounded-md px-4 py-2 cursor-pointer ${
                paymentGateway === gw.key ? 'border-gray-900' : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="paymentGateway"
                checked={paymentGateway === gw.key}
                onChange={() => setPaymentGateway(gw.key)}
              />
              <span className="text-sm font-medium text-gray-900">{gw.label}</span>
            </label>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Razorpay</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="razorpayMode"
                checked={form.razorpayMode === 'test'}
                onChange={() => setField('razorpayMode', 'test')}
              />
              Test Mode
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="razorpayMode"
                checked={form.razorpayMode === 'live'}
                onChange={() => setField('razorpayMode', 'live')}
              />
              Live Mode
            </label>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Key ID</label>
              <input
                className="input w-full"
                placeholder="rzp_test_xxxxxxxx"
                value={form.razorpayKeyId}
                onChange={(e) => setField('razorpayKeyId', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Key Secret</label>
              <input
                type="password"
                className="input w-full"
                placeholder={form.razorpayHasKeySecret ? form.razorpayKeySecretMasked : 'Enter Key Secret'}
                value={form.razorpayKeySecret}
                onChange={(e) => setField('razorpayKeySecret', e.target.value)}
              />
              {form.razorpayHasKeySecret && (
                <p className="text-xs text-gray-400 mt-1">Currently saved: {form.razorpayKeySecretMasked}. Leave blank to keep it.</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Stripe</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="stripeMode"
                checked={form.stripeMode === 'test'}
                onChange={() => setField('stripeMode', 'test')}
              />
              Test Mode
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="stripeMode"
                checked={form.stripeMode === 'live'}
                onChange={() => setField('stripeMode', 'live')}
              />
              Live Mode
            </label>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Publishable Key</label>
              <input
                className="input w-full"
                placeholder="pk_test_xxxxxxxx"
                value={form.stripePublishableKey}
                onChange={(e) => setField('stripePublishableKey', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Secret Key</label>
              <input
                type="password"
                className="input w-full"
                placeholder={form.stripeHasSecretKey ? form.stripeSecretKeyMasked : 'sk_test_xxxxxxxx'}
                value={form.stripeSecretKey}
                onChange={(e) => setField('stripeSecretKey', e.target.value)}
              />
              {form.stripeHasSecretKey && (
                <p className="text-xs text-gray-400 mt-1">Currently saved: {form.stripeSecretKeyMasked}. Leave blank to keep it.</p>
              )}
            </div>
          </div>
        </div>

        {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
