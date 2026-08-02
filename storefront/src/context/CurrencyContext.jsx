import { createContext, useContext, useEffect, useState } from 'react';
import { fetchCurrencies } from '../api/currency';

const CurrencyContext = createContext(null);
const STORAGE_KEY = 'piaarya_currency';

const INR = { code: 'INR', symbol: '₹', rate: 1 };

export function CurrencyProvider({ children }) {
  const [currencies, setCurrencies] = useState([INR]);
  const [code, setCode] = useState(() => localStorage.getItem(STORAGE_KEY) || 'INR');

  useEffect(() => {
    fetchCurrencies()
      .then((data) => setCurrencies(data.currencies?.length ? data.currencies : [INR]))
      .catch(() => setCurrencies([INR]));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, code);
  }, [code]);

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
