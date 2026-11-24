const mongoose = require('mongoose');

// Singleton document (one row, no `store` field) holding CartDodo's own
// platform-wide config:
// - razorpay: used to charge store owners for their Basic/Super plan
//   subscription. Deliberately separate from the per-store
//   Settings.razorpay, which is each store's own gateway for charging its
//   own customers.
// - sms: Fast2SMS API key used to send OTP-login and order-update SMS on
//   behalf of every store. Unlike Razorpay, SMS isn't money flowing to a
//   store owner's own account — it's a utility CartDodo provides as part of
//   the plan (Basic = email only, Super = email + SMS), so one shared key
//   covers every store instead of each owner needing their own Fast2SMS
//   account.
const platformSettingsSchema = new mongoose.Schema(
  {
    razorpay: {
      mode: { type: String, enum: ['test', 'live'], default: 'test' },
      keyId: { type: String, default: '' },
      keySecret: { type: String, default: '' },
    },
    sms: {
      fast2smsApiKey: { type: String, default: '' },
    },
    // Monthly price (in INR) CartDodo charges a store on each plan — what
    // Settings > Billing's "current cycle" amount is computed from. 0 until
    // set here.
    planPricing: {
      basic: { type: Number, default: 0 },
      super: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
