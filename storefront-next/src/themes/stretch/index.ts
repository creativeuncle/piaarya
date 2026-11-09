export { default as Home } from './Home';
export { default as ProductListing } from './ProductListing';
export { default as ProductDetail } from './ProductDetail';
export { default as ProductReviewsPage } from './ProductReviewsPage';

export { default as Header } from './Header';
export { default as Footer } from './Footer';
export { default as CartDrawer } from './CartDrawer';

import { stretchDisplay, stretchSans } from './fonts';
export const fontVariables = `${stretchDisplay.variable} ${stretchSans.variable}`;
export const bodyFontFamily = 'var(--font-stretch-sans)';
