'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'piaarya_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function lineKey(item) {
  return `${item.productId}|${item.variantSku || ''}`;
}

export function CartProvider({ children }) {
  // Starts empty on both server and the first client render so the cart badge/count
  // matches during hydration; the real cached cart (if any) loads right after mount.
  const [items, setItems] = useState([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function addToCart(newItem) {
    setItems((prev) => {
      const existing = prev.find((i) => lineKey(i) === lineKey(newItem));
      if (existing) {
        return prev.map((i) =>
          lineKey(i) === lineKey(newItem) ? { ...i, quantity: i.quantity + newItem.quantity } : i
        );
      }
      return [...prev, newItem];
    });
    setDrawerOpen(true);
  }

  function removeFromCart(item) {
    setItems((prev) => prev.filter((i) => lineKey(i) !== lineKey(item)));
  }

  function updateQuantity(item, quantity) {
    if (quantity < 1) return;
    setItems((prev) => prev.map((i) => (lineKey(i) === lineKey(item) ? { ...i, quantity } : i)));
  }

  function clearCart() {
    setItems([]);
    setOrderNote('');
    setAppliedCoupon(null);
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = appliedCoupon?.discountAmount || 0;
  const total = Math.max(subtotal - discount, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        count,
        subtotal,
        discount,
        total,
        appliedCoupon,
        setAppliedCoupon,
        isDrawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
        orderNote,
        setOrderNote,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
