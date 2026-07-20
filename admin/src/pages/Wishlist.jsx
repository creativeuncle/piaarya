import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { HeartIcon } from '@hugeicons/core-free-icons';
import { fetchWishlist, fetchPopularWishlistProducts, removeWishlistEntry } from '../api/wishlist';

export default function Wishlist() {
  const [entries, setEntries] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchWishlist()
      .then(setEntries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    fetchPopularWishlistProducts().then(setPopular).catch(() => {});
  }, []);

  async function handleRemove(id) {
    try {
      await removeWishlistEntry(id);
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <HugeiconsIcon icon={HeartIcon} size={22} strokeWidth={1.5} className="text-red-500" />
        Wishlist
      </h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {popular.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Most Wishlisted Products</h2>
          <div className="flex flex-wrap gap-3">
            {popular.map((p) => (
              <div key={p._id} className="bg-white rounded-lg shadow border border-gray-100 px-4 py-3 flex items-center gap-2">
                <HugeiconsIcon icon={HeartIcon} size={16} strokeWidth={1.5} className="text-red-500 shrink-0" />
                <span className="text-sm text-gray-900">{p.product?.name}</span>
                <span className="text-xs text-gray-400">×{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Added</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={6}>Loading...</td></tr>
            )}
            {!loading && entries.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={6}>No wishlist entries yet.</td></tr>
            )}
            {entries.map((entry) => (
              <tr key={entry._id}>
                <td className="px-4 py-3">
                  <HugeiconsIcon icon={HeartIcon} size={18} strokeWidth={1.5} className="text-red-500" />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{entry.customer?.name || '—'}</td>
                <td className="px-4 py-3">{entry.product?.name || '—'}</td>
                <td className="px-4 py-3">₹{entry.product?.price ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(entry.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleRemove(entry._id)} className="btn-action btn-action-red">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
