import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchMyOrders } from '../../api/me';

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders(token)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Your Orders</h1>
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && orders.length === 0 && (
        <p className="text-sm text-gray-500">You haven't placed any orders yet.</p>
      )}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-gray-900 text-sm">Order #{order.orderNumber}</p>
              <span className="text-xs uppercase tracking-wide bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <div className="space-y-3 mb-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0">
                    {item.product?.media?.[0]?.url && (
                      <img
                        src={item.product.media[0].url}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    {item.product?.name || 'Product'} × {item.quantity}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">₹{order.totalAmount}</p>
              <Link to={`/dashboard/orders/${order._id}`} className="text-sm text-gray-600 underline">
                View details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
