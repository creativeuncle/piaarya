// Shared visual tokens for the Stretch theme's section components. Kept as
// literal Tailwind arbitrary-value classes (not a global @theme block) so
// nothing here can leak into or collide with Supercharged's styling.
// Warm cream/gold palette ("Shades of Yellow") — light background, dark
// warm-brown text (previously a dark green background with white text).
export const BG_LIGHT = 'bg-[#F7EFDD]';
export const BG_LIGHT_ALT = 'bg-[#EEDFBE]';
export const DISPLAY_FONT = 'font-[family-name:var(--font-stretch-display)]';
export const EYEBROW = 'text-xs font-medium uppercase tracking-[0.3em] text-[#3A2E1D]/70';
export const PILL_BUTTON =
  'inline-flex items-center gap-2 rounded-full border-2 border-[#3A2E1D] px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#3A2E1D] transition-colors hover:bg-[#3A2E1D]/10';
