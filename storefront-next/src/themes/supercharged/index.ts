export { default as Home } from './Home';
export { default as ProductListing } from './ProductListing';
export { default as ProductDetail } from './ProductDetail';
export { default as ProductReviewsPage } from './ProductReviewsPage';

// Supercharged's chrome is the original shared components — re-exported
// here so every theme (including this one) is resolved the same way, via
// its own index.ts. These files are untouched.
export { default as Header } from '../../components/Header';
export { default as Footer } from '../../components/Footer';
export { default as CartDrawer } from '../../components/CartDrawer';

export const fontVariables = '';
export const bodyFontFamily = undefined;
