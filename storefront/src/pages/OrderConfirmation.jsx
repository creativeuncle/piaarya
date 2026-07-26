import { Link, useLocation, Navigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';

export default function OrderConfirmation() {
  const { state } = useLocation();

  if (!state?.orderNumber) return <Navigate to="/" replace />;

  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={48} strokeWidth={1.2} className="mx-auto text-green-600 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
      <p className="text-sm text-gray-500 mb-6">Thank you — we've received your order.</p>

      <div className="bg-gray-50 rounded-lg p-6 inline-block text-left mb-8">
        <p className="text-sm text-gray-500">Order Number</p>
        <p className="text-lg font-semibold text-gray-900">{state.orderNumber}</p>
        <p className="text-sm text-gray-500 mt-3">Amount Payable (Cash on Delivery)</p>
        <p className="text-lg font-semibold text-gray-900">₹{state.totalAmount}</p>
      </div>

      <div>
        <Link to="/products" className="inline-block bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-md">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
