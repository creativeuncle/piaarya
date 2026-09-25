'use client';

import { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '../../../../lib/api/settings';

export default function ThemeSettings() {
  const [active, setActive] = useState('supercharged');
  const [available, setAvailable] = useState([{ key: 'supercharged', name: 'Supercharged', description: '' }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        setActive(data.theme?.active || 'supercharged');
        setAvailable(data.theme?.available?.length ? data.theme.available : available);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const data = await updateSettings({ theme: { active } });
      setActive(data.theme?.active || active);
      setMessage('Theme updated. It goes live on the storefront immediately — no redeploy needed.');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Theme</h1>
      <p className="text-sm text-gray-500 mb-6">
        Pick which storefront theme is live. Navbar, cart, checkout, login and the customer dashboard stay the same
        across every theme — only the Home page, Product Listing and Product Detail design changes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {available.map((theme) => (
          <label
            key={theme.key}
            className={`border rounded-lg p-5 cursor-pointer ${
              active === theme.key ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-900">{theme.name}</span>
              <input
                type="radio"
                name="theme"
                checked={active === theme.key}
                onChange={() => setActive(theme.key)}
              />
            </div>
            {theme.description && <p className="text-xs text-gray-500">{theme.description}</p>}
          </label>
        ))}
      </div>

      {message && <p className="text-sm text-gray-600 mt-4">{message}</p>}

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
