'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { fetchCurrencies } from '../lib/api/currency';

const CurrencyContext = createContext(null);
const STORAGE_KEY = 'piaarya_currency';

const INR = { code: 'INR', symbol: '₹', rate: 1 };

function loadStoredCurrency() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'INR';
  } catch {
    return 'INR';
  }
}

export function CurrencyProvider({ children }) {
  const [currencies, setCurrencies] = useState([INR]);
  // Starts at INR on both server and the first client render so displayed prices
  // match during hydration; the real stored currency (if any) applies after mount.
  const [code, setCode] = useState('INR');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCode(loadStoredCurrency());
    setHydrated(true);
  }, []);

  useEffect(() => {
    fetchCurrencies()
      .then((data) => setCurrencies(data.currencies?.length ? data.currencies : [INR]))
      .catch(() => setCurrencies([INR]));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, code);
  }, [code, hydrated]);

  const current = currencies.find((c) => c.code === code) || INR;

  // Prices throughout the store are stored/charged in INR — this only
  // converts what's displayed while browsing, using the admin-set rate
  // (Settings > Currency). Checkout always charges in INR regardless of
  // the currency selected here.
  function formatPrice(amountInInr) {
    const converted = (Number(amountInInr) || 0) * current.rate;
    const rounded = current.code === 'INR' ? Math.round(converted) : Math.round(converted * 100) / 100;
    return `${current.symbol}${rounded}`;
  }

  return (
    <CurrencyContext.Provider value={{ currencies, currency: current, setCurrency: setCode, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
