'use client';

import { useEffect, useState } from 'react';
import { fetchCurrentCycle, fetchBills, exportBills } from '../../../../lib/api/billing';
import { SkeletonPage, SkeletonTableRows } from '../../../../components/Skeleton';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'open', label: 'Open' },
  { key: 'failed', label: 'Failed' },
  { key: 'processing', label: 'Processing' },
  { key: 'refunded', label: 'Refunded' },
  { key: 'canceled', label: 'Canceled' },
];

const STATUS_STYLES = {
  paid: 'bg-green-100 text-green-800',
  open: 'bg-gray-100 text-gray-700',
  failed: 'bg-red-100 text-red-700',
  processing: 'bg-blue-100 text-blue-700',
  refunded: 'bg-amber-100 text-amber-800',
  canceled: 'bg-gray-100 text-gray-500',
};

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAmount(amount) {
  return `₹${Number(amount || 0).toFixed(2)}`;
}

export default function Billing() {
  const [cycle, setCycle] = useState(null);
  const [bills, setBills] = useState([]);
  const [activeStatus, setActiveStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [billsLoading, setBillsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurrentCycle()
      .then(setCycle)
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setBillsLoading(true);
    fetchBills(activeStatus)
      .then(setBills)
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setBillsLoading(false));
  }, [activeStatus]);

  async function handleExport() {
    try {
      await exportBills(activeStatus);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  if (loading) return <SkeletonPage />;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Billing</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <h2 className="text-sm font-medium text-gray-700 mb-2">Current billing cycle</h2>
      <div className="bg-white rounded-lg shadow border border-gray-100 mb-8">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <span className="text-3xl font-semibold text-gray-900">{formatAmount(cycle?.amount)}</span>
            <span className="text-sm text-gray-500 ml-2">{cycle?.currency || 'INR'}</span>
            {cycle && (
              <p className="text-sm text-gray-500 mt-1">
                Running total · {formatDate(cycle.cycleStart)} - {formatDate(cycle.cycleEnd)}
              </p>
            )}
          </div>
          <span className="text-gray-300 text-xl">›</span>
        </div>
        <div className="border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={() => alert('Adding a payment method is coming soon — needs the platform Razorpay account to be live first.')}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1.5"
          >
            <span className="text-lg leading-none">⊕</span>
            Add payment method
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700">Past bills</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn-secondary text-xs px-3 py-1.5">
            Export bills
          </button>
          <button
            onClick={() => alert('Expense reports are coming soon.')}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            Create expense report
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {STATUS_TABS.map((tab) => (
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

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Date issued</th>
              <th className="px-4 py-3">Bill number</th>
              <th className="px-4 py-3">Bill type</th>
              <th className="px-4 py-3">Payment status</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {billsLoading && <SkeletonTableRows colSpan={5} />}
            {!billsLoading && bills.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-gray-400" colSpan={5}>No bills yet.</td>
              </tr>
            )}
            {!billsLoading && bills.map((bill) => (
              <tr key={bill._id}>
                <td className="px-4 py-3 text-gray-700">{formatDate(bill.issuedAt)}</td>
                <td className="px-4 py-3 text-gray-700">#{bill.billNumber}</td>
                <td className="px-4 py-3 text-gray-700">{bill.billType}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${STATUS_STYLES[bill.status] || 'bg-gray-100 text-gray-700'}`}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">{formatAmount(bill.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
