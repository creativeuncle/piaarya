import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders, updateOrderStatus } from '../api/orders';
import { ORDER_STATUSES } from '../constants/orderStatuses';

const TABS = [{ key: 'all', label: 'All' }, ...ORDER_STATUSES];

export default function Orders() {
  const [activeStatus, setActiveStatus] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchOrders(activeStatus)
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeStatus]);

  async function handleStatusChange(orderId, status) {
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Orders</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveStatus(tab.key)}
            className={`px-3 py-1.5 rounded-md text-sm border ${
              activeStatus === tab.key
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td className="px-4 py-4 text-gray-400" colSpan={6}>Loading...</td>
              </tr>
            )}
            {!loading && orders.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-400" colSpan={6}>No orders found.</td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                <td className="px-4 py-3">{order.customer?.name || '—'}</td>
                <td className="px-4 py-3">₹{order.totalAmount}</td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="border border-gray-200 rounded px-2 py-1 text-sm"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/orders/${order._id}/invoice`}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    Print Invoice
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
