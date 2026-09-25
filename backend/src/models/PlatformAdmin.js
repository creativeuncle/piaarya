const mongoose = require('mongoose');

// Platform-level "Super Admin" — operates the whole Piaarya SaaS, not any
// one store. Deliberately has no `store` field, so the tenant-scoping
// plugin (middleware/tenantScopePlugin.js) leaves it alone entirely: it's
// never auto-filtered by a request's store, and email is unique across the
// whole platform rather than per-store.
const platformAdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlatformAdmin', platformAdminSchema);
