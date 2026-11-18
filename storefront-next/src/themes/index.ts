import * as supercharged from './supercharged';
import * as stretch from './stretch';

// Every theme must export the same shape: Home, ProductListing, ProductDetail,
// ProductReviewsPage. Shared pages (navbar, cart drawer, checkout, login,
// dashboard) live outside themes/ and never change between themes.
//
// Loading states: use the shared skeleton components from
// `src/components/Skeleton.tsx` (SkeletonProductGrid, SkeletonProductRow,
// SkeletonCategoryRow, SkeletonReviewRow, SkeletonProductDetail, etc.)
// instead of a plain "Loading..." label — pass `tone="dark"` on a
// dark-background theme. A new theme should reuse these rather than
// building its own, so loading states stay consistent across themes.
export const THEMES = {
  supercharged,
  stretch,
} as const;

export const DEFAULT_THEME = 'supercharged';

export function getTheme(key: string) {
  return THEMES[key as keyof typeof THEMES] || THEMES[DEFAULT_THEME];
}
