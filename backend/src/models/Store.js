const mongoose = require('mongoose');

// A tenant on the platform — one Store = one client's shop. Every
// store-scoped collection (Product, Order, Customer, etc.) will carry a
// `store` reference once tenant-scoping is wired up; this model is just the
// tenant record itself.
const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and hyphens'],
    },
    // Optional custom domain the store owner has pointed at the platform,
    // in addition to the default <slug>.yourdomain.com.
    customDomain: { type: String, trim: true, lowercase: true, default: '' },
    owner: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, trim: true, default: '' },
    },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    plan: { type: String, enum: ['free', 'starter', 'pro'], default: 'free' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Store', storeSchema);
