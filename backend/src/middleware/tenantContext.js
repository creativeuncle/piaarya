// Carries "which store is this request for" across the whole async call chain
// of a request, so model queries can auto-scope themselves without every
// controller having to pass a storeId explicitly.
const { AsyncLocalStorage } = require('async_hooks');

const storage = new AsyncLocalStorage();

function runWithStore(storeId, fn) {
  return storage.run({ storeId: String(storeId) }, fn);
}

function getCurrentStoreId() {
  const ctx = storage.getStore();
  return ctx ? ctx.storeId : null;
}

module.exports = { runWithStore, getCurrentStoreId };
