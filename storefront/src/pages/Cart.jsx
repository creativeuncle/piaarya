import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { SquareLock01Icon, ShoppingBag01Icon } from '@hugeicons/core-free-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { validateCoupon } from '../api/coupons';

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  const {
    items,
    subtotal,
    discount,
    total,
    appliedCoupon,
    setAppliedCoupon,
    removeFromCart,
    updateQuantity,
    orderNote,
    setOrderNote,
  } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState(null);
  const [checking, setChecking] = useState(false);

  async function handleApplyCoupon(e) {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setChecking(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(couponCode.trim(), subtotal);
      if (result.valid) {
        setAppliedCoupon(result);
      } else {
        setAppliedCoupon(null);
        setCouponError(result.message);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || err.message);
    } finally {
      setChecking(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <HugeiconsIcon icon={ShoppingBag01Icon} size={40} strokeWidth={1.2} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-sm text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="inline-block bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-md">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {items.map((item) => (
            <div key={`${item.productId}|${item.variantSku || ''}`} className="flex gap-4 py-6">
              <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between gap-2">
                  <p className="text-sm text-gray-900 font-medium">{item.name}</p>
                  <p className="text-sm text-gray-900 font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </div>
                {item.variantLabel && <p className="text-sm text-gray-500 mt-1">{item.variantLabel}</p>}
                <p className="text-sm text-gray-400 mt-1">{formatPrice(item.price)} each</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => updateQuantity(item, item.quantity - 1)}
                      className="px-3 py-1.5 text-gray-600"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                      className="px-3 py-1.5 text-gray-600"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item)} className="text-sm text-gray-500 underline">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Order note</label>
          <textarea
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            rows={3}
            placeholder="Special instructions for your order"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <Link to="/products" className="inline-block mt-6 text-sm text-gray-600 underline">
          ← Continue Shopping
        </Link>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Order Summary</h2>

          <form onSubmit={handleApplyCoupon} className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm uppercase"
                disabled={Boolean(appliedCoupon)}
              />
              {appliedCoupon ? (
                <button type="button" onClick={removeCoupon} className="border border-gray-300 text-sm px-4 py-2 rounded-md">
                  Remove
                </button>
              ) : (
                <button type="submit" disabled={checking} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50">
                  {checking ? 'Checking...' : 'Apply'}
                </button>
              )}
            </div>
            {couponError && <p className="text-xs text-red-600 mt-2">{couponError}</p>}
            {appliedCoupon && <p className="text-xs text-green-600 mt-2">{appliedCoupon.message}</p>}
          </form>

          <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {appliedCoupon && discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedCoupon.code})</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-gray-900 border-t border-gray-200 pt-3 mt-3">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Link
            to={isAuthenticated ? '/checkout' : '/login?redirect=/checkout'}
            className="w-full mt-5 bg-blue-700 hover:bg-blue-800 text-white font-semibold uppercase tracking-wide text-sm py-3.5 rounded-md flex items-center justify-center gap-2"
          >
            <HugeiconsIcon icon={SquareLock01Icon} size={16} strokeWidth={1.5} />
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
