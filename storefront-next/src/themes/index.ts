import * as supercharged from './supercharged';

// Every theme must export the same shape: Home, ProductListing, ProductDetail,
// ProductReviewsPage. Shared pages (navbar, cart drawer, checkout, login,
// dashboard) live outside themes/ and never change between themes.
export const THEMES = {
  supercharged,
} as const;

export const DEFAULT_THEME = 'supercharged';

export function getTheme(key: string) {
  return THEMES[key as keyof typeof THEMES] || THEMES[DEFAULT_THEME];
}
