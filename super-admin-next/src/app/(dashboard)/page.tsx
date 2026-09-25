'use client';

import { useEffect, useState } from 'react';
import StatCard from '../../components/StatCard';
import { fetchDashboard } from '../../lib/api/stores';

const STAT_LABELS = [
  ['totalStores', 'Total Stores'],
  ['activeStores', 'Active Stores'],
  ['suspendedStores', 'Suspended Stores'],
  ['totalOrders', 'Total Orders (all stores)'],
  ['totalCustomers', 'Total Customers (all stores)'],
  ['totalRevenue', 'Total Revenue (all stores)'],
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard()
      .then(setStats)
      .catch((err) => setError(err?.response?.data?.message || err.message));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Platform Dashboard</h1>
      {error && <p className="text-red-600 text-sm mb-4">Failed to load stats: {error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_LABELS.map(([key, label]) => (
          <StatCard
            key={key}
            label={label}
            value={stats ? (key === 'totalRevenue' ? `₹${stats[key]}` : stats[key]) : '—'}
          />
        ))}
      </div>
    </div>
  );
}
