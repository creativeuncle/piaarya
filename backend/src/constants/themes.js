// Catalog of storefront themes the admin can pick between in Settings > Theme.
// Each entry's `key` must match a folder under storefront-next/src/themes/.
// Shared pages (navbar, cart, checkout, login, dashboard) don't change between
// themes — only the Home/Product Listing/Product Detail experience does.
const THEMES_CATALOG = [
  { key: 'supercharged', name: 'Supercharged', description: 'The original Piaarya storefront design.' },
];

module.exports = THEMES_CATALOG;
