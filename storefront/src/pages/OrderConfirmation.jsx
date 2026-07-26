import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle01Icon, Alert02Icon } from '@hugeicons/core-free-icons';
import { confirmStripeOrder } from '../api/orders';
import { useCart } from '../context/CartContext';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(Boolean(sessionId));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    confirmStripeOrder(sessionId)
      .then((data) => {
        setResult(data);
        if (data.status === 'paid') clearCart();
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (!sessionId && !state?.orderNumber) return <Navigate to="/" replace />;

  if (loading) {
    return <p className="text-center text-gray-400 text-sm py-24">Confirming your payment...</p>;
  }

  if (sessionId && (error || result?.status !== 'paid')) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <HugeiconsIcon icon={Alert02Icon} size={48} strokeWidth={1.2} className="mx-auto text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment not completed</h1>
        <p className="text-sm text-gray-500 mb-6">
          {error || "We couldn't confirm your payment yet. If you completed checkout, please wait a moment and refresh."}
        </p>
        <Link to="/checkout" className="inline-block bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-md">
          Back to Checkout
        </Link>
      </div>
    );
  }

  const orderNumber = sessionId ? result?.orderNumber : state.orderNumber;
  const totalAmount = sessionId ? result?.totalAmount : state.totalAmount;

  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={48} strokeWidth={1.2} className="mx-auto text-green-600 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
      <p className="text-sm text-gray-500 mb-6">Thank you — we've received your order.</p>

      <div className="bg-gray-50 rounded-lg p-6 inline-block text-left mb-8">
        <p className="text-sm text-gray-500">Order Number</p>
        <p className="text-lg font-semibold text-gray-900">{orderNumber}</p>
        <p className="text-sm text-gray-500 mt-3">{sessionId ? 'Amount Paid' : 'Amount Payable (Cash on Delivery)'}</p>
        <p className="text-lg font-semibold text-gray-900">₹{totalAmount}</p>
      </div>

      <div>
        <Link to="/products" className="inline-block bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-md">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
