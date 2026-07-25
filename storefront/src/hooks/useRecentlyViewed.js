const STORAGE_KEY = 'piaarya_recently_viewed';
const MAX_ITEMS = 10;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordView(productId) {
  const ids = load().filter((id) => id !== productId);
  ids.unshift(productId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)));
}

export function getRecentlyViewed(excludeId) {
  return load().filter((id) => id !== excludeId);
}
