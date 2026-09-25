'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatformAuth } from '../context/PlatformAuthContext';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const { isAuthenticated, hydrated } = usePlatformAuth();

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace('/login');
  }, [hydrated, isAuthenticated, router]);

  // Avoid flashing the dashboard before we know whether there's a session.
  if (!hydrated || !isAuthenticated) return null;

  return children;
}
