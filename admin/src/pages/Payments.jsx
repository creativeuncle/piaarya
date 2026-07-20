import { useEffect, useState } from 'react';
import { fetchTransactions, refundOrder } from '../api/payments';

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
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchTransactions(activeStatus !== 'all' ? { status: activeStatus } : {})
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [activeStatus]);

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
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={8}>Loading...</td></tr>
            )}
            {!loading && transactions.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={8}>No transactions found.</td></tr>
            )}
            {transactions.map((t) => (
              <tr key={t._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{t.order?.orderNumber || '—'}</td>
                <td className="px-4 py-3">{t.order?.customer?.name || '—'}</td>
                <td className="px-4 py-3">{TYPE_LABELS[t.type]}</td>
                <td className="px-4 py-3">₹{t.amount}</td>
                <td className="px-4 py-3 uppercase text-xs">{t.method || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${
                    t.status === 'success' ? 'text-green-600' : t.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {t.type === 'charge' && t.status === 'success' && t.order?.paymentStatus !== 'refunded' && (
                    <button onClick={() => setRefundTarget(t)} className="text-blue-600 hover:underline">Refund</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {refundTarget && (
        <RefundModal
          transaction={refundTarget}
          onClose={() => setRefundTarget(null)}
          onSaved={() => {
            setRefundTarget(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function RefundModal({ transaction, onClose, onSaved }) {
  const [amount, setAmount] = useState(transaction.amount);
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await refundOrder(transaction.order._id, { amount: Number(amount), reason });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Refund — {transaction.order?.orderNumber}</h2>
        <p className="text-sm text-gray-500">Order total: ₹{transaction.amount}</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Refund amount</label>
          <input type="number" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <p className="text-xs text-gray-400 mt-1">Enter the full amount for a full refund, or less for a partial refund.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Customer requested cancellation" />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
            {saving ? 'Processing...' : 'Process Refund'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
