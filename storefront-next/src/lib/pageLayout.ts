// Server-only helper (used from Server Components) — same pattern as
// lib/theme.ts: hits the backend directly, falls back to an empty layout
// (the page's own component renders nothing extra) if it can't be reached,
// so the storefront never breaks over this.
export type PageSection = {
  key: string;
  type: string;
  visible: boolean;
  settings: Record<string, unknown>;
};

export async function getPageLayout(page: string): Promise<PageSection[]> {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
  try {
    const res = await fetch(`${backendUrl}/api/page-layout/${page}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('page layout request failed');
    const data = await res.json();
    return Array.isArray(data.sections) ? data.sections : [];
  } catch {
    return [];
  }
}
