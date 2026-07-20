import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchReturns, setReturnStatus, setPickupStatus, setRefundStatus } from '../api/returns';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'requested', label: 'Requested' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const PICKUP_OPTIONS = [
  { key: 'not_scheduled', label: 'Not Scheduled' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'picked_up', label: 'Picked Up' },
];

const REFUND_OPTIONS = [
  { key: 'not_applicable', label: 'N/A' },
  { key: 'pending', label: 'Pending' },
  { key: 'processed', label: 'Processed' },
  { key: 'failed', label: 'Failed' },
];

export default function Returns() {
  const [activeStatus, setActiveStatus] = useState('all');
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchReturns(activeStatus !== 'all' ? { status: activeStatus } : {})
      .then(setReturns)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [activeStatus]);

  async function handleStatus(id, status) {
    try {
      const updated = await setReturnStatus(id, status);
      setReturns((prev) => prev.map((r) => (r._id === id ? { ...r, status: updated.status } : r)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePickup(id, pickupStatus) {
    try {
      await setPickupStatus(id, pickupStatus);
      setReturns((prev) => prev.map((r) => (r._id === id ? { ...r, pickupStatus } : r)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRefund(id, refundStatus) {
    try {
      await setRefundStatus(id, refundStatus);
      setReturns((prev) => prev.map((r) => (r._id === id ? { ...r, refundStatus } : r)));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Returns</h1>
        <Link to="/returns/new" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800">
          New Return / Exchange
        </Link>
      </div>

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

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pickup Status</th>
              <th className="px-4 py-3">Refund Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={7}>Loading...</td></tr>
            )}
            {!loading && returns.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={7}>No return requests found.</td></tr>
            )}
            {returns.map((r) => (
              <tr key={r._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{r.order?.orderNumber || '—'}</td>
                <td className="px-4 py-3">{r.order?.customer?.name || '—'}</td>
                <td className="px-4 py-3 capitalize">{r.type}</td>
                <td className="px-4 py-3">{r.reason}</td>
                <td className="px-4 py-3">
                  {r.status === 'requested' ? (
                    <div className="space-x-2">
                      <button onClick={() => handleStatus(r._id, 'approved')} className="btn-action btn-action-green">Approve</button>
                      <button onClick={() => handleStatus(r._id, 'rejected')} className="btn-action btn-action-red">Reject</button>
                    </div>
                  ) : (
                    <span className={`text-xs font-medium ${r.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                      {r.status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select className="input" value={r.pickupStatus} onChange={(e) => handlePickup(r._id, e.target.value)}>
                    {PICKUP_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="input"
                    value={r.refundStatus}
                    onChange={(e) => handleRefund(r._id, e.target.value)}
                    disabled={r.type === 'exchange'}
                  >
                    {REFUND_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
