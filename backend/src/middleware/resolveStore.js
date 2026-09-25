// Figures out which store a request belongs to and makes that available to
// the rest of the request (req.store/req.storeId, plus the AsyncLocalStorage
// context the tenant-scope plugin reads from).
//
// There's no subdomain routing or admin login yet, so for now the store is
// resolved from an explicit `X-Store-Id` header / `storeId` query param,
// falling back to the single "default" store created by the migration
// script. That keeps every existing admin-next/storefront-next request
// working unchanged (they send neither), while already giving APIs a way to
// address a specific store once multi-store admin auth exists.
const Store = require('../models/Store');
const { runWithStore } = require('./tenantContext');

const DEFAULT_STORE_SLUG = process.env.DEFAULT_STORE_SLUG || 'default';

async function resolveStore(req, res, next) {
  try {
    const explicitId = req.headers['x-store-id'] || req.query.storeId;
    let store = null;

    if (explicitId) {
      store = await Store.findById(explicitId).catch(() => null);
    }
    if (!store) {
      store = await Store.findOne({ slug: DEFAULT_STORE_SLUG });
    }
    if (!store) {
      return res.status(503).json({
        message: 'No store is configured yet. Run scripts/migrate-default-store.js first.',
      });
    }

    req.store = store;
    req.storeId = store._id;
    runWithStore(store._id, next);
  } catch (err) {
    next(err);
  }
}

module.exports = resolveStore;
