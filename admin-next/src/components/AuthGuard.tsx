'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAdminAuth();

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace('/login');
  }, [hydrated, isAuthenticated, router]);

  // Avoid flashing the dashboard before we know whether there's a session.
  if (!hydrated || !isAuthenticated) return null;

  return children;
}
