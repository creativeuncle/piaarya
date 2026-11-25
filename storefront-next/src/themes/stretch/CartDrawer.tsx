'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, ShoppingBag01Icon, Add01Icon, Remove01Icon, SquareLock01Icon } from '@hugeicons/core-free-icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { DISPLAY_FONT } from './styles';

export default function CartDrawer() {
  const { items, count, total, removeFromCart, updateQuantity, isDrawerOpen, closeDrawer } = useCart();
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();

  return (
    <>
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 z-[60] bg-[#3A2E1D]/50 transition-opacity ${
          isDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      <div
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col bg-[#EEDFBE] text-[#3A2E1D] shadow-2xl transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-[#3A2E1D]/15 px-6 py-5">
          <h2 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
            <HugeiconsIcon icon={ShoppingBag01Icon} size={18} strokeWidth={1.5} />
            {count} {count === 1 ? 'Item' : 'Items'}
          </h2>
          <button type="button" onClick={closeDrawer} aria-label="Close cart" className="text-[#3A2E1D]">
            <HugeiconsIcon icon={Cancel01Icon} size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[#3A2E1D]/60">Your cart is empty.</p>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={`${item.productId}|${item.variantSku || ''}`} className="flex gap-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[#E4D2A6]">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`${DISPLAY_FONT} text-base leading-tight text-[#3A2E1D]`}>{item.name}</h3>
                      <span className="shrink-0 text-sm text-[#3A2E1D]">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                    {item.variantLabel && <p className="mt-0.5 text-xs text-[#3A2E1D]/60">{item.variantLabel}</p>}

                    <div className="mt-3 flex items-center gap-4">
                      <div className="inline-flex items-center gap-3 rounded-full border border-[#3A2E1D]/30 px-3 py-1">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => updateQuantity(item, item.quantity - 1)}
                          className="text-[#3A2E1D]"
                        >
                          <HugeiconsIcon icon={Remove01Icon} size={14} />
                        </button>
                        <span className="w-4 text-center text-xs text-[#3A2E1D]">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          className="text-[#3A2E1D]"
                        >
                          <HugeiconsIcon icon={Add01Icon} size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item)}
                        className="text-xs text-[#3A2E1D]/60 underline-offset-2 hover:text-[#3A2E1D] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#3A2E1D]/15 px-6 py-5">
            <p className="mb-3 text-xs text-[#3A2E1D]/50">Shipping &amp; taxes calculated at checkout</p>
            <Link
              href={isAuthenticated ? '/checkout' : '/login?redirect=/checkout'}
              onClick={closeDrawer}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#3A2E1D] py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#3A2E1D] transition-colors hover:bg-[#3A2E1D]/10"
            >
              <HugeiconsIcon icon={SquareLock01Icon} size={16} />
              Checkout · {formatPrice(total)}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
