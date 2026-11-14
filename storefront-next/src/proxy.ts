import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

// Replaces the old next.config.mjs rewrites for /api and /uploads. A plain
// rewrite's proxied request doesn't reliably carry the browser's original
// Host (it's on its own connection to BACKEND_URL), so on a multi-tenant
// deployment (every store on its own subdomain or custom domain) the
// backend's resolveStore middleware would have no way to tell which store a
// browser-side API call belongs to. Proxying by hand here lets us attach
// the original Host explicitly as X-Forwarded-Host, which resolveStore
// already reads.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const destination = `${BACKEND_URL}${pathname}${search}`;

  const headers = new Headers(request.headers);
  const originalHost = request.headers.get('host') || '';
  headers.set('x-forwarded-host', originalHost);
  headers.delete('host');
  headers.delete('content-length');

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };
  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  const backendResponse = await fetch(destination, init);

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: backendResponse.headers,
  });
}

export const config = {
  matcher: ['/api/:path*', '/uploads/:path*'],
};
