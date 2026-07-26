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
  const [selected, setSelected] = useState(null);

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
      const patch = { status: updated.status, refundStatus: updated.refundStatus, refundResult: updated.refundResult };
      setReturns((prev) => prev.map((r) => (r._id === id ? { ...r, ...patch } : r)));
      setSelected((prev) => (prev && prev._id === id ? { ...prev, ...patch } : prev));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePickup(id, pickupStatus) {
    try {
      await setPickupStatus(id, pickupStatus);
      setReturns((prev) => prev.map((r) => (r._id === id ? { ...r, pickupStatus } : r)));
      setSelected((prev) => (prev && prev._id === id ? { ...prev, pickupStatus } : prev));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRefund(id, refundStatus) {
    try {
      await setRefundStatus(id, refundStatus);
      setReturns((prev) => prev.map((r) => (r._id === id ? { ...r, refundStatus } : r)));
      setSelected((prev) => (prev && prev._id === id ? { ...prev, refundStatus } : prev));
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
              <th className="px-4 py-3">Refund Status</th>
              <th className="px-4 py-3"></th>
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
                  <span className={`text-xs font-medium capitalize ${
                    r.status === 'approved' ? 'text-green-600' : r.status === 'rejected' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize">{r.refundStatus.replace('_', ' ')}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelected(r)} className="btn-action">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {selected.type === 'exchange' ? 'Exchange' : 'Return'} Request
              </h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-sm">
                Close
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500">Order</p>
                <p className="font-medium text-gray-900">{selected.order?.orderNumber || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">{selected.order?.customer?.name || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Items</p>
                <div className="space-y-1">
                  {selected.items?.map((item, idx) => (
                    <p key={idx} className="text-gray-800">
                      {item.product?.name || 'Product'} {item.variantSku ? `(${item.variantSku})` : ''} × {item.quantity}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-gray-500">Reason</p>
                <p className="text-gray-800">{selected.reason}</p>
              </div>
              {selected.notes && (
                <div>
                  <p className="text-gray-500">Notes</p>
                  <p className="text-gray-800">{selected.notes}</p>
                </div>
              )}

              {selected.type === 'return' && (
                <div>
                  <p className="text-gray-500 mb-1">Refund Transfer To</p>
                  {selected.refundMethod === 'upi' && (
                    <p className="text-gray-800">UPI — {selected.refundDetails?.upiId || '—'}</p>
                  )}
                  {selected.refundMethod === 'bank' && (
                    <p className="text-gray-800">
                      Bank — {selected.refundDetails?.accountHolderName}, A/C {selected.refundDetails?.accountNumber}, IFSC{' '}
                      {selected.refundDetails?.ifsc}
                    </p>
                  )}
                  {!selected.refundMethod && <p className="text-gray-400">Not provided</p>}
                </div>
              )}

              {selected.refundResult?.reference && (
                <div className="bg-green-50 border border-green-100 rounded-md p-3">
                  <p className="text-green-700 font-medium">Refund processed via {selected.refundResult.gateway}</p>
                  <p className="text-green-600 text-xs">
                    ₹{selected.refundResult.amount} · Ref: {selected.refundResult.reference}
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    Simulated transfer — no live gateway credentials are connected yet.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 mb-1">Pickup Status</p>
                  <select
                    className="input w-full"
                    value={selected.pickupStatus}
                    onChange={(e) => handlePickup(selected._id, e.target.value)}
                  >
                    {PICKUP_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Refund Status</p>
                  <select
                    className="input w-full"
                    value={selected.refundStatus}
                    onChange={(e) => handleRefund(selected._id, e.target.value)}
                    disabled={selected.type === 'exchange'}
                  >
                    {REFUND_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className={`text-sm font-medium capitalize ${
                  selected.status === 'approved' ? 'text-green-600' : selected.status === 'rejected' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  Status: {selected.status}
                </span>
                {selected.status === 'requested' && (
                  <div className="space-x-2">
                    <button onClick={() => handleStatus(selected._id, 'approved')} className="btn-action btn-action-green">Approve</button>
                    <button onClick={() => handleStatus(selected._id, 'rejected')} className="btn-action btn-action-red">Reject</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
