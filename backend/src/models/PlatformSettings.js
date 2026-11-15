const mongoose = require('mongoose');

// Singleton document (one row, no `store` field) holding CartDodo's own
// payment config — used to charge store owners for their Basic/Super plan
// subscription. Deliberately separate from the per-store Settings.razorpay,
// which is each store's own gateway for charging its own customers.
const platformSettingsSchema = new mongoose.Schema(
  {
    razorpay: {
      mode: { type: String, enum: ['test', 'live'], default: 'test' },
      keyId: { type: String, default: '' },
      keySecret: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
