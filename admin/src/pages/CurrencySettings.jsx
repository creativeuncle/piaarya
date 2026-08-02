import { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '../api/settings';

export default function CurrencySettings() {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings()
      .then((data) => setCurrencies(data.currency?.currencies || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function setField(code, field, value) {
    setCurrencies((prev) => prev.map((c) => (c.code === code ? { ...c, [field]: value } : c)));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const data = await updateSettings({
        currency: { currencies: currencies.map((c) => ({ code: c.code, rate: Number(c.rate) || 0, isEnabled: c.isEnabled })) },
      });
      setCurrencies(data.currency?.currencies || []);
      setMessage('Currency settings updated.');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Currency</h1>
      <p className="text-sm text-gray-500 mb-6">
        Your store's base currency is INR — all orders are charged and recorded in INR. Enabling a currency here lets
        customers view prices converted at the rate you set below (browsing only). There's no live exchange-rate feed
        connected, so update these rates yourself periodically — they won't track the market automatically.
      </p>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Currency</th>
              <th className="px-4 py-3">Rate (per ₹1)</th>
              <th className="px-4 py-3">Enabled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-4 py-3 font-medium text-gray-900">₹ INR (base)</td>
              <td className="px-4 py-3 text-gray-400">1.00</td>
              <td className="px-4 py-3 text-gray-400">Always on</td>
            </tr>
            {currencies.map((c) => (
              <tr key={c.code}>
                <td className="px-4 py-3 font-medium text-gray-900">{c.symbol} {c.code} — {c.name}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    step="0.0001"
                    className="input w-28"
                    value={c.rate || ''}
                    onChange={(e) => setField(c.code, 'rate', e.target.value)}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={c.isEnabled}
                    onChange={(e) => setField(c.code, 'isEnabled', e.target.checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {message && <p className="text-sm text-gray-600 mt-4">{message}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
