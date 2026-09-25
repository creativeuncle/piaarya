// Figures out which store a request belongs to and makes that available to
// the rest of the request (req.store/req.storeId, plus the AsyncLocalStorage
// context the tenant-scope plugin reads from).
//
// Resolution order:
//   1. A logged-in store admin's token (Authorization: Bearer <admin JWT>)
//      — the store they belong to, so admin-next requests are scoped to
//      the store the logged-in team member actually works for.
//   2. An explicit `X-Store-Id` header / `storeId` query param, or a
//      `storeSlug` in the request body — needed for the admin *login*
//      request itself, which by definition has no token yet: without this,
//      TeamMember.findOne({email}) would always be auto-scoped to the
//      default store below, and no other store's admin could ever log in.
//   3. The single "default" store created by the migration script.
// There's no subdomain routing yet for storefront requests, so those still
// fall through to (3) until a store is resolved from the storefront's
// domain — that's separate, still-pending work.
const Store = require('../models/Store');
const { runWithStore } = require('./tenantContext');
const { verifyAdminToken } = require('./adminAuth');

const DEFAULT_STORE_SLUG = process.env.DEFAULT_STORE_SLUG || 'default';

async function resolveStore(req, res, next) {
  try {
    let store = null;

    const authHeader = req.headers.authorization || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (bearer) {
      try {
        const payload = verifyAdminToken(bearer);
        if (payload.storeId) {
          store = await Store.findById(payload.storeId);
        }
      } catch {
        // Not a valid admin token (could be a customer token, or none) —
        // fall through to the other resolution strategies below.
      }
    }

    if (!store) {
      const explicitId = req.headers['x-store-id'] || req.query.storeId || req.body?.storeId;
      if (explicitId) {
        store = await Store.findById(explicitId).catch(() => null);
      }
    }
    if (!store) {
      const explicitSlug = req.headers['x-store-slug'] || req.query.storeSlug || req.body?.storeSlug;
      if (explicitSlug) {
        store = await Store.findOne({ slug: String(explicitSlug).toLowerCase().trim() });
      }
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
