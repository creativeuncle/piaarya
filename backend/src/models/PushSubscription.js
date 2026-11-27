const mongoose = require('mongoose');

// One device registered to receive push notifications (e.g. "new order
// placed") for a store's admin team. `type` is kept generic so a future
// native app can plug in alongside today's PWA without a schema change:
// - web-push: a browser/PWA's Push API subscription (endpoint + keys)
// - fcm: a native app's Firebase Cloud Messaging device token
const pushSubscriptionSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    teamMember: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember', required: true },
    type: { type: String, enum: ['web-push', 'fcm'], required: true },
    // web-push fields
    endpoint: { type: String },
    keys: {
      p256dh: String,
      auth: String,
    },
    // fcm fields (not wired to a real sender yet — reserved for a future
    // native app; see pushNotificationService.sendFcmPush)
    fcmToken: { type: String },
    label: { type: String, default: '' },
  },
  { timestamps: true }
);

pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true, sparse: true });
pushSubscriptionSchema.index({ fcmToken: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
