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
//   3. The request's Host header — `<slug>.<CENTRAL_DOMAIN>` for a store's
//      default address, or a verified row in the `domains` collection for a
//      connected custom domain. This is what makes storefront traffic
//      arriving on a real domain resolve to the right store; a reverse
//      proxy in front of this server must forward the original Host (most
//      do, or set X-Forwarded-Host, which is preferred here when present).
//   4. The single "default" store created by the migration script — the
//      final fallback for plain localhost/IP access in local development.
const Store = require('../models/Store');
const Domain = require('../models/Domain');
const { runWithStore } = require('./tenantContext');
const { verifyAdminToken } = require('./adminAuth');

const DEFAULT_STORE_SLUG = process.env.DEFAULT_STORE_SLUG || 'default';
const CENTRAL_DOMAIN = (process.env.CENTRAL_DOMAIN || '').toLowerCase().trim();

async function resolveByHost(rawHost) {
  if (!rawHost) return null;
  const host = String(rawHost).split(':')[0].toLowerCase(); // strip any port

  if (CENTRAL_DOMAIN && host.endsWith(`.${CENTRAL_DOMAIN}`)) {
    const slug = host.slice(0, -(CENTRAL_DOMAIN.length + 1));
    if (!slug || slug === 'www') return null;
    return Store.findOne({ slug });
  }

  const domainDoc = await Domain.findOne({ domain: host, verificationStatus: 'verified' });
  if (!domainDoc) return null;
  return Store.findById(domainDoc.store);
}

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
      const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
      store = await resolveByHost(hostHeader);
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
