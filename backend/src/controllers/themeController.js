const Settings = require('../models/Settings');
const THEMES_CATALOG = require('../constants/themes');

// Public, read-only endpoint the storefront calls on every page load to pick
// which theme's Home/Product Listing/Product Detail components to render.
async function getActiveTheme(req, res, next) {
  try {
    const settings = await Settings.findOne();
    const active = settings?.theme?.active || THEMES_CATALOG[0].key;
    res.json({ theme: active });
  } catch (err) {
    next(err);
  }
}

async function listThemes(req, res, next) {
  try {
    res.json(THEMES_CATALOG);
  } catch (err) {
    next(err);
  }
}

module.exports = { getActiveTheme, listThemes };
