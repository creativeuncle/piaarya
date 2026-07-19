import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { fetchDashboardStats } from '../api/dashboard';

const STAT_LABELS = [
  ['totalRevenue', 'Total Revenue'],
  ['totalOrders', 'Total Orders'],
  ['processingOrders', 'Processing Orders'],
  ['totalCustomers', 'Total Customers'],
  ['totalProducts', 'Total Products'],
  ['totalCategories', 'Total Categories'],
  ['totalReviews', 'Total Reviews'],
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Home</h1>
      {error && (
        <p className="text-red-600 text-sm mb-4">Failed to load stats: {error}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
