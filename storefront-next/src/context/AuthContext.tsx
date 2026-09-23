'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../lib/api/auth';

const AuthContext = createContext(null);
const STORAGE_KEY = 'piaarya_auth';

function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Starts null on both server and the first client render (hydration pass) so the
  // authenticated-vs-guest markup matches; the real cached auth (if any) is only
  // applied after mount, once hydration has already completed.
  const [auth, setAuth] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAuth(loadAuth());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    else localStorage.removeItem(STORAGE_KEY);
  }, [auth, hydrated]);

  useEffect(() => {
    if (!auth?.token) return;
    authApi
      .fetchMe(auth.token)
      .then(({ customer }) => setAuth((prev) => (prev ? { ...prev, customer } : prev)))
      .catch(() => setAuth(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  async function signup(payload) {
    const data = await authApi.signup(payload);
    setAuth(data);
    return data;
  }

  async function login(payload) {
    const data = await authApi.login(payload);
    setAuth(data);
    return data;
  }

  async function loginWithOtp(phone, otp) {
    const data = await authApi.verifyOtp(phone, otp);
    setAuth(data);
    return data;
  }

  function logout() {
    setAuth(null);
  }

  return (
    <AuthContext.Provider
      value={{
        customer: auth?.customer || null,
        token: auth?.token || null,
        isAuthenticated: Boolean(auth?.token),
        signup,
        login,
        loginWithOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
