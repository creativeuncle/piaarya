import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, Add01Icon } from '@hugeicons/core-free-icons';
import { useAuth } from '../../context/AuthContext';
import { fetchAddresses, addAddress, deleteAddress } from '../../api/me';

const EMPTY_FORM = { label: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India', isDefault: false };

export default function Address() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    fetchAddresses(token)
      .then(setAddresses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await addAddress(token, form);
      setAddresses(updated);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(index) {
    const updated = await deleteAddress(token, index);
    setAddresses(updated);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Your Address</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-900 border border-gray-300 rounded-md px-3 py-1.5"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.5} />
          Add Address
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="border border-gray-200 rounded-lg p-4 mb-6 space-y-3 max-w-md">
          <input
            placeholder="Label (e.g. Home, Office)"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            placeholder="Address Line 1"
            required
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            placeholder="Address Line 2"
            value={form.line2}
            onChange={(e) => setForm({ ...form, line2: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="City"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <input
              placeholder="State"
              required
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Pincode"
              required
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <input
              placeholder="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Set as default address
          </label>
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white font-medium px-6 py-2.5 rounded-md text-sm disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Address'}
          </button>
        </form>
      )}

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && addresses.length === 0 && (
        <p className="text-sm text-gray-500">No saved addresses yet.</p>
      )}

      <div className="space-y-3">
        {addresses.map((addr, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-gray-900 text-sm">{addr.label || 'Address'}</p>
                {addr.isDefault && (
                  <span className="text-[10px] uppercase tracking-wide bg-gray-900 text-white px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ''}
              </p>
              <p className="text-sm text-gray-600">
                {addr.city}, {addr.state} {addr.pincode}
              </p>
              <p className="text-sm text-gray-600">{addr.country}</p>
            </div>
            <button onClick={() => handleDelete(index)} aria-label="Delete address" className="text-gray-400 hover:text-red-500">
              <HugeiconsIcon icon={Delete02Icon} size={18} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
