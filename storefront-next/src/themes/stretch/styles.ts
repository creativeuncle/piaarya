// Shared visual tokens for the Stretch theme's section components. Kept as
// literal Tailwind arbitrary-value classes (not a global @theme block) so
// nothing here can leak into or collide with Supercharged's styling.
export const DARK_BG = 'bg-[#41473d]';
export const MID_BG = 'bg-[#646c5f]';
export const DISPLAY_FONT = 'font-[family-name:var(--font-stretch-display)]';
export const EYEBROW = 'text-xs font-medium uppercase tracking-[0.3em] text-white/70';
export const PILL_BUTTON =
  'inline-flex items-center gap-2 rounded-full border-2 border-white px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10';
