const Cart = require('../models/Cart');

// A synced cart with no activity for this long is considered abandoned.
const INACTIVITY_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour
const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

// Runs with no tenant context set, so tenantScopePlugin leaves the query
// unscoped — this sweeps every store's carts in one pass instead of looping
// per store.
async function markAbandonedCarts() {
  try {
    const cutoff = new Date(Date.now() - INACTIVITY_THRESHOLD_MS);
    await Cart.updateMany(
      { status: 'active', lastActivityAt: { $lt: cutoff }, 'items.0': { $exists: true } },
      { status: 'abandoned' }
    );
  } catch (err) {
    console.error('Abandoned-cart sweep failed:', err.message);
  }
}

function startCartAbandonmentJob() {
  markAbandonedCarts();
  setInterval(markAbandonedCarts, CHECK_INTERVAL_MS);
}

module.exports = { startCartAbandonmentJob, markAbandonedCarts };
