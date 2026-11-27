'use client';

import { useEffect, useState } from 'react';
import { fetchTransactions } from '../../../lib/api/payments';
import { fetchCustomers } from '../../../lib/api/customers';
import { fetchProducts } from '../../../lib/api/products';
import { SkeletonTableRows } from '../../../components/Skeleton';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'success', label: 'Success' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
];

const TYPE_LABELS = {
  charge: 'Charge',
  refund: 'Refund',
  partial_refund: 'Partial Refund',
};

export default function Payments() {
  const [activeStatus, setActiveStatus] = useState('all');
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers().then(setCustomers).catch(() => {});
    fetchProducts({ limit: 200 }).then((data) => setProducts(data.products)).catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    setError(null);
    const params: Record<string, string> = {};
    if (activeStatus !== 'all') params.status = activeStatus;
    if (customerId) params.customer = customerId;
    if (productId) params.product = productId;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    fetchTransactions(params)
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [activeStatus, customerId, productId, dateFrom, dateTo]);

  function clearFilters() {
    setCustomerId('');
    setProductId('');
    setDateFrom('');
    setDateTo('');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Payments</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveStatus(tab.key)}
            className={`px-3 py-1.5 rounded-md text-sm border ${
              activeStatus === tab.key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Customer</label>
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="input min-w-[180px]">
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Product</label>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="input min-w-[180px]">
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
        {(customerId || productId || dateFrom || dateTo) && (
          <button onClick={clearFilters} className="text-sm text-gray-500 underline mb-2">Clear filters</button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <SkeletonTableRows colSpan={7} />}
            {!loading && transactions.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={7}>No transactions found.</td></tr>
            )}
            {transactions.map((t) => (
              <tr key={t._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{t.order?.orderNumber || '—'}</td>
                <td className="px-4 py-3">{t.order?.customer?.name || '—'}</td>
                <td className="px-4 py-3">{TYPE_LABELS[t.type]}</td>
                <td className="px-4 py-3">₹{t.amount}</td>
                <td className="px-4 py-3 uppercase text-xs">
                  {t.method || '—'}
                  {t.type !== 'charge' && t.simulated === true && (
                    <span className="block normal-case text-[10px] text-gray-400">simulated — no gateway credentials</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${
                    t.status === 'success' ? 'text-green-600' : t.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
