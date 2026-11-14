import { headers } from 'next/headers';

// Server Components fetch the backend directly (not through the browser's
// /api/* proxy), so the incoming request's Host never reaches the backend
// on its own — this reads it from the current request and hands it back as
// a header to attach to that fetch, so resolveStore can still tell which
// store's subdomain (or custom domain) the request came in on.
export async function getTenantHeaders(): Promise<Record<string, string>> {
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host') || '';
  return host ? { 'X-Forwarded-Host': host } : {};
}
