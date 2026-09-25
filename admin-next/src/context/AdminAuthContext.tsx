'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import '../lib/authToken';
import * as adminAuthApi from '../lib/api/adminAuth';

const STORAGE_KEY = 'piaarya_admin_auth';

const AdminAuthContext = createContext(null);

function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }) {
  // Starts null on both server and the client's first (hydration) render so
  // the markup matches, then loads the real cached session after mount —
  // same pattern as storefront-next's AuthContext.
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
    adminAuthApi
      .fetchMe(auth.token)
      .then(({ member }) => setAuth((prev) => (prev ? { ...prev, member } : prev)))
      .catch(() => setAuth(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  async function login(payload) {
    const data = await adminAuthApi.login(payload);
    setAuth(data);
    return data;
  }

  function logout() {
    setAuth(null);
  }

  return (
    <AdminAuthContext.Provider
      value={{
        member: auth?.member || null,
        token: auth?.token || null,
        isAuthenticated: Boolean(auth?.token),
        hydrated,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
