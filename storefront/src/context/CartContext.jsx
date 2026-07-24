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
  const [items, setItems] = useState(loadCart);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [orderNote, setOrderNote] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

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

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        count,
        subtotal,
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
