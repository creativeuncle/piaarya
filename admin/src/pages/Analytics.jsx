import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { fetchAnalyticsSummary, fetchSalesTrend, fetchTopProducts, fetchOrderStatusBreakdown } from '../api/analytics';

const COLORS = ['#111827', '#4b5563', '#9ca3af', '#d1d5db', '#6366f1', '#f59e0b', '#10b981', '#ef4444'];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export default function Analytics() {
  const [from, setFrom] = useState(daysAgoISO(30));
  const [to, setTo] = useState(todayISO());
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = { from, to };
    Promise.all([
      fetchAnalyticsSummary(params),
      fetchSalesTrend(params),
      fetchTopProducts({ ...params, limit: 8 }),
      fetchOrderStatusBreakdown(params),
    ])
      .then(([s, t, p, b]) => {
        setSummary(s);
        setTrend(t);
        setTopProducts(p);
        setStatusBreakdown(b);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [from, to]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-400 text-sm">Loading...</p>}

      {!loading && summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <StatCard label="Revenue" value={`₹${summary.revenue}`} />
            <StatCard label="Orders" value={summary.orders} />
            <StatCard label="Avg Order Value" value={`₹${summary.avgOrderValue}`} />
            <StatCard label="New Customers" value={summary.newCustomers} />
            <StatCard label="Returning Customers" value={summary.returningCustomers} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Sales Trend</h2>
              {trend.length === 0 ? (
                <p className="text-sm text-gray-400">No sales in this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value, name) => [name === 'revenue' ? `₹${value}` : value, name]} />
                    <Line type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Orders by Status</h2>
              {statusBreakdown.length === 0 ? (
                <p className="text-sm text-gray-400">No orders in this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={statusBreakdown} dataKey="count" nameKey="status" outerRadius={90} label={(d) => d.status}>
                      {statusBreakdown.map((entry, i) => (
                        <Cell key={entry.status} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
            <h2 className="text-sm font-semibold text-gray-900 p-5 pb-0">Top Products</h2>
            <table className="min-w-full text-sm mt-3">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Units Sold</th>
                  <th className="px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.length === 0 && (
                  <tr><td className="px-4 py-4 text-gray-400" colSpan={3}>No sales in this period.</td></tr>
                )}
                {topProducts.map((p) => (
                  <tr key={p.productId}>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3">{p.unitsSold}</td>
                    <td className="px-4 py-3">₹{p.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
