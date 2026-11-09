import { Cormorant_Garamond, Jost } from 'next/font/google';

// Scoped to the Stretch theme only (applied via a wrapper div's className),
// never touched globally — Supercharged keeps its own default fonts.
export const stretchDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-stretch-display',
});

export const stretchSans = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-stretch-sans',
});
