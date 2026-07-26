import { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '../api/settings';

const GATEWAYS = [
  { key: 'razorpay', label: 'Razorpay' },
  { key: 'stripe', label: 'Stripe' },
];

export default function PaymentSettings() {
  const [paymentGateway, setPaymentGateway] = useState('razorpay');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings()
      .then((data) => setPaymentGateway(data.paymentGateway))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      await updateSettings({ paymentGateway });
      setMessage('Payment gateway updated.');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Payment Gateway</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-2xl">
        Choose which payment gateway processes customer refunds when a return request is approved. No live gateway
        credentials are connected yet — refunds are recorded as simulated transactions against the selected gateway
        so the flow can be swapped for a real Razorpay/Stripe integration later without changing the return process.
      </p>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6 max-w-md">
          <div className="space-y-3 mb-6">
            {GATEWAYS.map((gw) => (
              <label
                key={gw.key}
                className={`flex items-center gap-3 border rounded-md px-4 py-3 cursor-pointer ${
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

          {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}
