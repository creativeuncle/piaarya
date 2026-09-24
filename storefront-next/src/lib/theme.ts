import { DEFAULT_THEME } from '../themes';

// Server-only helper (used from Server Components) — hits the backend
// directly, not through the browser-facing /api rewrite, since this runs
// on the server. Falls back to the default theme if Settings can't be
// reached (e.g. no DB yet) so the storefront never breaks over this.
export async function getActiveTheme(): Promise<string> {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
  try {
    const res = await fetch(`${backendUrl}/api/theme`, { cache: 'no-store' });
    if (!res.ok) throw new Error('theme request failed');
    const data = await res.json();
    return data.theme || DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}
