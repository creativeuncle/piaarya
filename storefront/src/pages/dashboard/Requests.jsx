import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchMyRequests } from '../../api/me';

export default function Requests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRequests(token)
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Requests</h1>
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && requests.length === 0 && (
        <p className="text-sm text-gray-500">You haven't raised any return or exchange requests yet.</p>
      )}
      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900 text-sm">
                Order #{req.order?.orderNumber} · {req.type === 'exchange' ? 'Exchange' : 'Return'}
              </p>
              <span className="text-xs uppercase tracking-wide bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {req.status}
              </span>
            </div>
            <div className="space-y-1 mb-2">
              {req.items?.map((item, idx) => (
                <p key={idx} className="text-sm text-gray-700">
                  {item.product?.name || 'Product'} × {item.quantity}
                </p>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-1">Reason: {req.reason}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Pickup: {req.pickupStatus}</span>
              <span>Refund: {req.refundStatus}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
