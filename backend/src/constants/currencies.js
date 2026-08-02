// Catalog of currencies the storefront currency switcher can offer. Symbol
// is fixed here; each currency's exchange rate (against the store's base
// currency, INR) is set by the admin in Settings > Currency since this repo
// has no live FX-rate API wired up.
const CURRENCIES_CATALOG = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
];

module.exports = CURRENCIES_CATALOG;
