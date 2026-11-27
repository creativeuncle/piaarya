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
    // Meta WhatsApp Business Cloud API, used to deliver the Login with
    // WhatsApp OTP for every store — one shared "CartDodo"-branded WhatsApp
    // Business number, same reasoning as the shared Fast2SMS key above. A
    // cold-start OTP message (the customer hasn't messaged first) must go
    // through a pre-approved "Authentication" template, not freeform text —
    // otpTemplateName/otpTemplateLang must match whatever template gets
    // approved in the Meta Business account.
    whatsapp: {
      accessToken: { type: String, default: '' },
      phoneNumberId: { type: String, default: '' },
      otpTemplateName: { type: String, default: 'otp_login' },
      otpTemplateLang: { type: String, default: 'en_US' },
      // Meta's default sample authentication templates include a "Copy
      // code" button component that also needs the OTP as a parameter —
      // turn this off if the approved template has no button.
      hasCopyCodeButton: { type: Boolean, default: true },
    },
    // Monthly price (in INR) CartDodo charges a store on each plan — what
    // Settings > Billing's "current cycle" amount is computed from. 0 until
    // set here.
    planPricing: {
      basic: { type: Number, default: 0 },
      super: { type: Number, default: 0 },
    },
    // One shared VAPID key pair powers Web Push for every store's admin app
    // (PWA) — infrastructure-level, not a per-store credential, same
    // reasoning as the shared SMS/WhatsApp keys above. Auto-generated on
    // first use if empty (see pushNotificationService.getVapidKeys).
    webPush: {
      vapidPublicKey: { type: String, default: '' },
      vapidPrivateKey: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
