'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import '../lib/authToken';
import * as platformAuthApi from '../lib/api/platformAuth';

const STORAGE_KEY = 'piaarya_platform_auth';

const PlatformAuthContext = createContext(null);

function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function PlatformAuthProvider({ children }) {
  // Starts null on both server and the client's first (hydration) render so
  // the markup matches, then loads the real cached session after mount —
  // same pattern as admin-next's AdminAuthContext.
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
    if (!hydrated || !auth?.token) return;
    platformAuthApi
      .fetchMe(auth.token)
      .then(({ admin }) => setAuth((prev) => (prev ? { ...prev, admin } : prev)))
      .catch(() => setAuth(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  async function login(payload) {
    const data = await platformAuthApi.login(payload);
    setAuth(data);
    return data;
  }

  function logout() {
    setAuth(null);
  }

  return (
    <PlatformAuthContext.Provider
      value={{
        admin: auth?.admin || null,
        token: auth?.token || null,
        isAuthenticated: Boolean(auth?.token),
        hydrated,
        login,
        logout,
      }}
    >
      {children}
    </PlatformAuthContext.Provider>
  );
}

export function usePlatformAuth() {
  const ctx = useContext(PlatformAuthContext);
  if (!ctx) throw new Error('usePlatformAuth must be used within PlatformAuthProvider');
  return ctx;
}
