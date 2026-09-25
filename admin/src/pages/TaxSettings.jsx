import { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '../api/settings';
import { INDIAN_STATES } from '../constants/indianStates';

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <span className="relative inline-flex h-6 w-11 shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full bg-gray-300 peer-checked:bg-gray-900 transition-colors" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      {label && <span className="text-sm font-medium text-gray-900">{label}</span>}
    </label>
  );
}

const EMPTY_TAX = {
  gstEnabled: false,
  pricesIncludeTax: true,
  gstin: '',
  legalBusinessName: '',
  sellerState: '',
  defaultGstRate: 18,
};

export default function TaxSettings() {
  const [tax, setTax] = useState(EMPTY_TAX);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings()
      .then((data) => setTax({ ...EMPTY_TAX, ...data.tax }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function setField(field, value) {
    setTax((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const data = await updateSettings({ tax });
      setTax({ ...EMPTY_TAX, ...data.tax });
      setMessage('Tax settings updated.');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Tax (GST)</h1>
      <p className="text-sm text-gray-500 mb-6">
        Configure GST for order invoices. Product prices are treated as GST-inclusive by default (the standard for
        Indian D2C stores) — GST is broken out from that price on the invoice as CGST+SGST (same state as your
        business) or IGST (different state), it isn't added on top unless "Prices include tax" is turned off.
      </p>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 space-y-5">
        <Toggle checked={tax.gstEnabled} onChange={(v) => setField('gstEnabled', v)} label="Enable GST on orders" />

        {tax.gstEnabled && (
          <>
            <Toggle
              checked={tax.pricesIncludeTax}
              onChange={(v) => setField('pricesIncludeTax', v)}
              label="Prices include tax (GST-inclusive)"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">GSTIN</label>
                <input
                  className="input w-full"
                  placeholder="22AAAAA0000A1Z5"
                  value={tax.gstin}
                  onChange={(e) => setField('gstin', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Legal Business Name</label>
                <input
                  className="input w-full"
                  value={tax.legalBusinessName}
                  onChange={(e) => setField('legalBusinessName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Business State (for CGST+SGST vs IGST)</label>
                <select
                  className="input w-full"
                  value={tax.sellerState}
                  onChange={(e) => setField('sellerState', e.target.value)}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Default GST Rate (%)</label>
                <input
                  type="number"
                  className="input w-full"
                  value={tax.defaultGstRate}
                  onChange={(e) => setField('defaultGstRate', Number(e.target.value) || 0)}
                />
                <p className="text-xs text-gray-400 mt-1">Used when a product doesn't have its own GST rate set.</p>
              </div>
            </div>
          </>
        )}

        {message && <p className="text-sm text-gray-600">{message}</p>}

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
