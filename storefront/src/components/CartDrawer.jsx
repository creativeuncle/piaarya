import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingBag01Icon, Cancel01Icon, SquareLock01Icon } from '@hugeicons/core-free-icons';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { items, count, total, removeFromCart, updateQuantity, isDrawerOpen, closeDrawer, orderNote, setOrderNote } = useCart();
  const [showNote, setShowNote] = useState(false);

  return (
    <>
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-xl flex flex-col transition-transform duration-300 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-gray-900">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={20} strokeWidth={1.5} />
            {count} {count === 1 ? 'Item' : 'Items'}
          </div>
          <button onClick={closeDrawer} aria-label="Close cart">
            <HugeiconsIcon icon={Cancel01Icon} size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 && <p className="text-sm text-gray-400 text-center py-10">Your cart is empty.</p>}
          <div className="space-y-6">
            {items.map((item) => (
              <div key={`${item.productId}|${item.variantSku || ''}`} className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between gap-2">
                    <p className="text-sm text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-900 shrink-0">₹{item.price * item.quantity}</p>
                  </div>
                  {item.variantLabel && <p className="text-sm text-gray-500 mt-1">{item.variantLabel}</p>}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                        className="px-2.5 py-1 text-gray-600"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="px-2.5 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                        className="px-2.5 py-1 text-gray-600"
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
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-5">
            <button
              onClick={() => setShowNote((v) => !v)}
              className="text-sm text-gray-700 underline"
            >
              Add order note
            </button>
            {showNote && (
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Special instructions for your order"
                rows={3}
                className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            )}

            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>Shipping &amp; taxes calculated at checkout</span>
            </div>

            <Link
              to="/cart"
              onClick={closeDrawer}
              className="w-full mt-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold uppercase tracking-wide text-sm py-3.5 rounded-md flex items-center justify-center gap-2"
            >
              <HugeiconsIcon icon={SquareLock01Icon} size={16} strokeWidth={1.5} />
              Checkout · ₹{total}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
