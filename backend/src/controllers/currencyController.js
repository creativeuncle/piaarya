const Settings = require('../models/Settings');
const CURRENCIES_CATALOG = require('../constants/currencies');

// Public, read-only view of enabled currencies for the storefront switcher —
// deliberately excludes anything else in Settings (payment keys etc).
async function listPublicCurrencies(req, res, next) {
  try {
    const settings = await Settings.findOne();
    const stored = settings?.currency?.currencies || [];

    const enabled = [{ code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 1 }];
    CURRENCIES_CATALOG.filter((c) => c.code !== 'INR').forEach((c) => {
      const match = stored.find((s) => s.code === c.code);
      if (match?.isEnabled && match.rate > 0) {
        enabled.push({ code: c.code, name: c.name, symbol: c.symbol, rate: match.rate });
      }
    });

    res.json({ baseCurrency: 'INR', currencies: enabled });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPublicCurrencies };
