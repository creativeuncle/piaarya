import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orders';
import { fetchAddresses, addAddress } from '../api/me';

function emptyForm() {
  return { label: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' };
}

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, customer, token } = useAuth();
  const { items, subtotal, discount, total, appliedCoupon, clearCart } = useCart();

  const [contact, setContact] = useState({ name: customer?.name || '', email: customer?.email || '', phone: customer?.phone || '' });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyForm());
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAddresses(token)
      .then((addresses) => {
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          const defaultIndex = addresses.findIndex((a) => a.isDefault);
          setSelectedIndex(defaultIndex >= 0 ? defaultIndex : 0);
          setShowNewForm(false);
        } else {
          setShowNewForm(true);
        }
      })
      .catch(() => setShowNewForm(true))
      .finally(() => setAddressesLoading(false));
  }, [isAuthenticated, token]);

  function setContactField(field, value) {
    setContact((prev) => ({ ...prev, [field]: value }));
  }

  function setNewAddressField(field, value) {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/checkout" replace />;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-sm text-gray-500 mb-6">Add something to your cart before checking out.</p>
        <Link to="/products" className="inline-block bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-md">
          Continue Shopping
        </Link>
      </div>
    );
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError(null);

    const usingSaved = !showNewForm && selectedIndex !== null && savedAddresses[selectedIndex];
    const shippingAddress = usingSaved
      ? savedAddresses[selectedIndex]
      : {
          line1: newAddress.line1,
          line2: newAddress.line2,
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode,
          country: newAddress.country,
        };

    if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      setError('Please fill in a complete shipping address.');
      return;
    }

    setPlacing(true);
    try {
      const data = await createOrder({
        customer: contact,
        shippingAddress,
        items: items.map((item) => ({
          productId: item.productId,
          variantSku: item.variantSku || undefined,
          quantity: item.quantity,
        })),
        couponCode: appliedCoupon?.code,
        paymentMethod,
      });

      if (!usingSaved) {
        addAddress(token, { ...newAddress, isDefault: savedAddresses.length === 0 }).catch(() => {});
      }

      if (paymentMethod === 'stripe' && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      clearCart();
      navigate('/order-confirmation', { state: { orderNumber: data.orderNumber, totalAmount: data.totalAmount } });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
      <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input className="input" value={contact.name} onChange={(e) => setContactField('name', e.target.value)} required />
            </Field>
            <Field label="Phone" required>
              <input className="input" value={contact.phone} onChange={(e) => setContactField('phone', e.target.value)} required />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Email" required>
              <input type="email" className="input" value={contact.email} onChange={(e) => setContactField('email', e.target.value)} required />
            </Field>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Shipping Address</h2>

          {addressesLoading && <p className="text-sm text-gray-500">Loading addresses...</p>}

          {!addressesLoading && savedAddresses.length > 0 && (
            <div className="space-y-3 mb-4">
              {savedAddresses.map((addr, index) => (
                <label
                  key={index}
                  className={`flex items-start gap-3 border rounded-md px-4 py-3 cursor-pointer ${
                    !showNewForm && selectedIndex === index ? 'border-gray-900' : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingAddress"
                    checked={!showNewForm && selectedIndex === index}
                    onChange={() => {
                      setSelectedIndex(index);
                      setShowNewForm(false);
                    }}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-gray-900">{addr.label || 'Address'}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] uppercase tracking-wide bg-gray-900 text-white px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ''}
                    </p>
                    <p className="text-gray-600">
                      {addr.city}, {addr.state} {addr.pincode}, {addr.country}
                    </p>
                  </div>
                </label>
              ))}

              {!showNewForm && (
                <button
                  type="button"
                  onClick={() => setShowNewForm(true)}
                  className="text-sm font-medium text-gray-900 underline"
                >
                  + Add different address
                </button>
              )}
            </div>
          )}

          {showNewForm && (
            <div className="space-y-4">
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowNewForm(false);
                    setSelectedIndex((prev) => (prev === null ? 0 : prev));
                  }}
                  className="text-sm font-medium text-gray-900 underline"
                >
                  ← Use a saved address
                </button>
              )}
              <Field label="Label">
                <input
                  className="input"
                  placeholder="e.g. Home, Office"
                  value={newAddress.label}
                  onChange={(e) => setNewAddressField('label', e.target.value)}
                />
              </Field>
              <Field label="Address Line 1" required>
                <input className="input" value={newAddress.line1} onChange={(e) => setNewAddressField('line1', e.target.value)} required />
              </Field>
              <Field label="Address Line 2">
                <input className="input" value={newAddress.line2} onChange={(e) => setNewAddressField('line2', e.target.value)} />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="City" required>
                  <input className="input" value={newAddress.city} onChange={(e) => setNewAddressField('city', e.target.value)} required />
                </Field>
                <Field label="State" required>
                  <input className="input" value={newAddress.state} onChange={(e) => setNewAddressField('state', e.target.value)} required />
                </Field>
                <Field label="Pincode" required>
                  <input className="input" value={newAddress.pincode} onChange={(e) => setNewAddressField('pincode', e.target.value)} required />
                </Field>
              </div>
              <Field label="Country" required>
                <input className="input" value={newAddress.country} onChange={(e) => setNewAddressField('country', e.target.value)} required />
              </Field>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Payment Method</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 border border-gray-300 rounded-md px-4 py-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
              />
              <span className="text-sm text-gray-900 font-medium">Cash on Delivery</span>
            </label>
            <label className="flex items-center gap-3 border border-gray-300 rounded-md px-4 py-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'stripe'}
                onChange={() => setPaymentMethod('stripe')}
              />
              <span className="text-sm text-gray-900 font-medium">Pay Online (Card, via Stripe — test mode)</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={placing}
          className="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {placing ? 'Placing Order...' : `Place Order · ₹${total}`}
        </button>
      </form>

      <div className="lg:col-span-1">
        <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
            {items.map((item) => (
              <div key={`${item.productId}|${item.variantSku || ''}`} className="flex gap-3">
                <div className="w-14 h-14 bg-gray-100 rounded-md overflow-hidden shrink-0">
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 text-sm">
                  <p className="text-gray-900">{item.name}</p>
                  {item.variantLabel && <p className="text-gray-500 text-xs">{item.variantLabel}</p>}
                  <p className="text-gray-500 text-xs">Qty {item.quantity}</p>
                </div>
                <p className="text-sm text-gray-900 shrink-0">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {appliedCoupon && discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedCoupon.code})</span>
                <span>−₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-gray-900 border-t border-gray-200 pt-3 mt-3">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
