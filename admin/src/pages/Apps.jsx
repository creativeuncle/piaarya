import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Chatting01Icon,
  WhatsappIcon,
  Megaphone01Icon,
  InstagramIcon,
  TimeQuarterIcon,
  BellIcon,
  ShoppingBasket01Icon,
  DollarCircleIcon,
  CookieIcon,
  IdIcon,
  PuzzleIcon,
} from '@hugeicons/core-free-icons';
import { fetchApps, installApp, toggleApp, uninstallApp } from '../api/apps';

const ICON_MAP = {
  Chatting01Icon,
  WhatsappIcon,
  Megaphone01Icon,
  InstagramIcon,
  TimeQuarterIcon,
  BellIcon,
  ShoppingBasket01Icon,
  DollarCircleIcon,
  CookieIcon,
  IdIcon,
};

function Toggle({ checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span className="relative inline-flex h-5 w-9 shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full bg-gray-300 peer-checked:bg-gray-900 transition-colors" />
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
      <span className="text-xs text-gray-600">{checked ? 'Enabled' : 'Disabled'}</span>
    </label>
  );
}

export default function Apps() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyKey, setBusyKey] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchApps()
      .then(setApps)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleInstall(key) {
    setBusyKey(key);
    setError(null);
    try {
      await installApp(key);
      setApps((prev) => prev.map((a) => (a.key === key ? { ...a, isInstalled: true, isEnabled: true } : a)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setBusyKey(null);
    }
  }

  async function handleToggle(key, isEnabled) {
    setBusyKey(key);
    setError(null);
    try {
      await toggleApp(key, isEnabled);
      setApps((prev) => prev.map((a) => (a.key === key ? { ...a, isEnabled } : a)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setBusyKey(null);
    }
  }

  async function handleUninstall(key) {
    if (!window.confirm('Uninstall this app?')) return;
    setBusyKey(key);
    setError(null);
    try {
      await uninstallApp(key);
      setApps((prev) => prev.map((a) => (a.key === key ? { ...a, isInstalled: false, isEnabled: false } : a)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-2">
        <HugeiconsIcon icon={PuzzleIcon} size={24} strokeWidth={1.5} className="text-gray-900" />
        <h1 className="text-2xl font-semibold text-gray-900">Apps</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6 max-w-2xl">
        Install apps built for this store — all currently free, with paid apps planned later. Installing/enabling an
        app here tracks which ones are active for this store; each app's own feature still needs to be built into
        the storefront separately.
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-400 text-sm">Loading...</p>}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <div key={app.key} className="bg-white rounded-lg shadow border border-gray-100 p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                  <HugeiconsIcon icon={ICON_MAP[app.icon] || PuzzleIcon} size={20} strokeWidth={1.5} className="text-gray-700" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {app.isFree ? 'Free' : `₹${app.price}`}
                </span>
              </div>

              <h2 className="text-sm font-semibold text-gray-900 mb-1">{app.name}</h2>
              <p className="text-xs text-gray-400 mb-1">{app.category}</p>
              <p className="text-sm text-gray-600 flex-1 mb-4">{app.description}</p>

              {app.isInstalled ? (
                <div className="flex items-center justify-between">
                  <Toggle checked={app.isEnabled} onChange={(v) => handleToggle(app.key, v)} />
                  <button
                    onClick={() => handleUninstall(app.key)}
                    disabled={busyKey === app.key}
                    className="text-red-600 text-xs font-medium disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleInstall(app.key)}
                  disabled={busyKey === app.key}
                  className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {busyKey === app.key ? 'Installing...' : 'Install'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
