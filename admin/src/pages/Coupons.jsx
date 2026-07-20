import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCoupons, deleteCoupon, fetchCouponAnalytics } from '../api/coupons';

const TYPE_LABELS = {
  fixed: 'Fixed',
  percentage: 'Percentage',
  buy_x_get_y: 'Buy X Get Y',
};

export default function Coupons() {
  const [tab, setTab] = useState('list');
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchCoupons(search ? { search } : {})
      .then(setCoupons)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (tab === 'analytics' && analytics === null) {
      fetchCouponAnalytics().then(setAnalytics).catch((err) => setError(err.message));
    }
  }, [tab, analytics]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Coupons</h1>
        {tab === 'list' && (
          <Link to="/coupons/new" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800">
            Add Coupon
          </Link>
        )}
      </div>

      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {['list', 'analytics'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px capitalize ${
              tab === t ? 'border-gray-900 text-gray-900 font-medium' : 'border-transparent text-gray-500'
            }`}
          >
            {t === 'list' ? 'Coupons' : 'Analytics'}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {tab === 'list' && (
        <>
          <input
            type="text"
            placeholder="Search by code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-64 mb-4"
          />
          <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Applies To</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Auto Apply</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr><td className="px-4 py-4 text-gray-400" colSpan={8}>Loading...</td></tr>
                )}
                {!loading && coupons.length === 0 && (
                  <tr><td className="px-4 py-4 text-gray-400" colSpan={8}>No coupons yet.</td></tr>
                )}
                {coupons.map((coupon) => (
                  <tr key={coupon._id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {coupon.code}
                      {coupon.firstOrderOnly && (
                        <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">First Order</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{TYPE_LABELS[coupon.discountType]}</td>
                    <td className="px-4 py-3">
                      {coupon.discountType === 'fixed' && `₹${coupon.discountValue}`}
                      {coupon.discountType === 'percentage' && `${coupon.discountValue}%`}
                      {coupon.discountType === 'buy_x_get_y' && `Buy ${coupon.buyQuantity} Get ${coupon.getQuantity}`}
                    </td>
                    <td className="px-4 py-3 capitalize">{coupon.appliesTo}</td>
                    <td className="px-4 py-3">{coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td>
                    <td className="px-4 py-3">{coupon.autoApply ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">
                      {coupon.isActive ? (
                        <span className="text-green-600 text-xs font-medium">Active</span>
                      ) : (
                        <span className="text-gray-400 text-xs font-medium">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3 space-x-3">
                      <Link to={`/coupons/${coupon._id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                      <button onClick={() => handleDelete(coupon._id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'analytics' && (
        <div>
          {analytics === null && <p className="text-gray-400 text-sm">Loading...</p>}
          {analytics && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="Total Coupons" value={analytics.totalCoupons} />
                <StatCard label="Active Coupons" value={analytics.activeCoupons} />
                <StatCard label="Total Redemptions" value={analytics.totalRedemptions} />
              </div>
              <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Redemptions</th>
                      <th className="px-4 py-3">Limit</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {analytics.coupons.map((c) => (
                      <tr key={c._id}>
                        <td className="px-4 py-3 font-medium text-gray-900">{c.code}</td>
                        <td className="px-4 py-3">{TYPE_LABELS[c.discountType]}</td>
                        <td className="px-4 py-3">{c.usedCount}</td>
                        <td className="px-4 py-3">{c.usageLimit || 'Unlimited'}</td>
                        <td className="px-4 py-3">{c.isActive ? 'Active' : 'Inactive'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Redemption counts will populate once the storefront checkout applies coupons to orders.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
