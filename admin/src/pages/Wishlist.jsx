import { useEffect, useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { HeartIcon } from '@hugeicons/core-free-icons';
import { fetchWishlist, fetchPopularWishlistProducts, removeWishlistEntry } from '../api/wishlist';

export default function Wishlist() {
  const [allEntries, setAllEntries] = useState([]);
  const [entries, setEntries] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productFilter, setProductFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  function load() {
    setLoading(true);
    setError(null);
    fetchWishlist()
      .then((data) => {
        setAllEntries(data);
        setEntries(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    fetchPopularWishlistProducts().then(setPopular).catch(() => {});
  }, []);

  const productOptions = useMemo(() => {
    const map = new Map();
    allEntries.forEach((entry) => {
      if (entry.product?._id) map.set(entry.product._id, entry.product.name);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [allEntries]);

  const categoryOptions = useMemo(() => {
    const map = new Map();
    allEntries.forEach((entry) => {
      const cat = entry.product?.category;
      if (cat?._id) map.set(cat._id, cat.name);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [allEntries]);

  useEffect(() => {
    let filtered = allEntries;
    if (productFilter) filtered = filtered.filter((e) => e.product?._id === productFilter);
    if (categoryFilter) filtered = filtered.filter((e) => e.product?.category?._id === categoryFilter);
    setEntries(filtered);
  }, [productFilter, categoryFilter, allEntries]);

  async function handleRemove(id) {
    try {
      await removeWishlistEntry(id);
      setAllEntries((prev) => prev.filter((e) => e._id !== id));
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

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 bg-white"
        >
          <option value="">All Products</option>
          {productOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 bg-white"
        >
          <option value="">All Categories</option>
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {(productFilter || categoryFilter) && (
          <button
            onClick={() => {
              setProductFilter('');
              setCategoryFilter('');
            }}
            className="text-sm text-gray-500 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Added</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={7}>Loading...</td></tr>
            )}
            {!loading && entries.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={7}>No wishlist entries found.</td></tr>
            )}
            {entries.map((entry) => (
              <tr key={entry._id}>
                <td className="px-4 py-3">
                  <HugeiconsIcon icon={HeartIcon} size={18} strokeWidth={1.5} className="text-red-500" />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{entry.customer?.name || '—'}</td>
                <td className="px-4 py-3">{entry.product?.name || '—'}</td>
                <td className="px-4 py-3">{entry.product?.category?.name || '—'}</td>
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
