import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders, updateOrderStatus, updateOrderTracking } from '../api/orders';
import { fetchCustomers } from '../api/customers';
import { fetchProducts } from '../api/products';
import { ORDER_STATUSES } from '../constants/orderStatuses';

const TABS = [{ key: 'all', label: 'All' }, ...ORDER_STATUSES];

export default function Orders() {
  const [activeStatus, setActiveStatus] = useState('all');
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);

  useEffect(() => {
    fetchCustomers().then(setCustomers).catch(() => {});
    fetchProducts({ limit: 200 }).then((data) => setProducts(data.products)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (activeStatus !== 'all') params.status = activeStatus;
    if (customerId) params.customer = customerId;
    if (productId) params.product = productId;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    fetchOrders(params)
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeStatus, customerId, productId, dateFrom, dateTo]);

  function clearFilters() {
    setCustomerId('');
    setProductId('');
    setDateFrom('');
    setDateTo('');
  }

  async function handleStatusChange(orderId, status) {
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveTracking(orderId, payload) {
    try {
      const updated = await updateOrderTracking(orderId, payload);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      setTrackingOrder(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
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
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tracking</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td className="px-4 py-4 text-gray-400" colSpan={7}>Loading...</td>
              </tr>
            )}
            {!loading && orders.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-400" colSpan={7}>No orders found.</td>
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
                <td className="px-4 py-3">
                  <button onClick={() => setTrackingOrder(order)} className="btn-action btn-action-blue">
                    {order.shipping?.trackingNumber ? order.shipping.trackingNumber : 'Add Tracking'}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/orders/${order._id}/invoice`}
                    target="_blank"
                    className="btn-action btn-action-blue"
                  >
                    Print Invoice
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {trackingOrder && (
        <TrackingModal
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
          onSave={(payload) => handleSaveTracking(trackingOrder._id, payload)}
        />
      )}
    </div>
  );
}

function TrackingModal({ order, onClose, onSave }) {
  const [carrier, setCarrier] = useState(order.shipping?.carrier || '');
  const [trackingNumber, setTrackingNumber] = useState(order.shipping?.trackingNumber || '');
  const [trackingUrl, setTrackingUrl] = useState(order.shipping?.trackingUrl || '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({ carrier, trackingNumber, trackingUrl });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Tracking — {order.orderNumber}</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
          <input className="input" placeholder="e.g. Delhivery, Shiprocket" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
          <input className="input" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tracking URL</label>
          <input className="input" value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
