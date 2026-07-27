import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCustomers, setCustomerBlocked } from '../api/customers';
import { fetchProducts } from '../api/products';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [productId, setProductId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts({ limit: 200 }).then((data) => setProducts(data.products)).catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    setError(null);
    const params = {};
    if (search) params.search = search;
    if (productId) params.product = productId;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    fetchCustomers(params)
      .then(setCustomers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, productId, dateFrom, dateTo]);

  function clearFilters() {
    setSearch('');
    setProductId('');
    setDateFrom('');
    setDateTo('');
  }

  async function toggleBlock(customer) {
    try {
      await setCustomerBlocked(customer._id, !customer.isBlocked);
      setCustomers((prev) =>
        prev.map((c) => (c._id === customer._id ? { ...c, isBlocked: !customer.isBlocked } : c))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Customers</h1>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-64"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Registered From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Registered To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Purchased Product</label>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="input min-w-[180px]">
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
        {(search || productId || dateFrom || dateTo) && (
          <button onClick={clearFilters} className="text-sm text-gray-500 underline mb-2">Clear filters</button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Reward Points</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={6}>Loading...</td></tr>
            )}
            {!loading && customers.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={6}>No customers found.</td></tr>
            )}
            {customers.map((customer) => (
              <tr key={customer._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{customer.name}</td>
                <td className="px-4 py-3">{customer.email}</td>
                <td className="px-4 py-3">{customer.ordersCount}</td>
                <td className="px-4 py-3">{customer.rewardPoints}</td>
                <td className="px-4 py-3">
                  {customer.isBlocked ? (
                    <span className="text-red-600 text-xs font-medium">Blocked</span>
                  ) : (
                    <span className="text-green-600 text-xs font-medium">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 space-x-3">
                  <Link to={`/customers/${customer._id}`} className="btn-action btn-action-blue">View</Link>
                  <button onClick={() => toggleBlock(customer)} className="btn-action btn-action-gray">
                    {customer.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
