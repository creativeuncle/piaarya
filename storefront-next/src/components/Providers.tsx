'use client';

import { AuthProvider } from '../context/AuthContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { CartProvider } from '../context/CartContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>{children}</CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
