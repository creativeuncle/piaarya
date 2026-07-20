import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCustomers, setCustomerBlocked } from '../api/customers';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchCustomers(search ? { search } : {})
      .then(setCustomers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input w-72 mb-4"
      />

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
                  <Link to={`/customers/${customer._id}`} className="text-blue-600 hover:underline">View</Link>
                  <button onClick={() => toggleBlock(customer)} className="text-gray-600 hover:underline">
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
