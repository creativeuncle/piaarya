const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    paymentGateway: { type: String, enum: ['razorpay', 'stripe'], default: 'razorpay' },
    razorpay: {
      mode: { type: String, enum: ['test', 'live'], default: 'test' },
      keyId: String,
      keySecret: String,
    },
    stripe: {
      mode: { type: String, enum: ['test', 'live'], default: 'test' },
      publishableKey: String,
      secretKey: String,
    },
    notifications: {
      channels: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: true },
      },
      events: { type: mongoose.Schema.Types.Mixed, default: {} },
      email: {
        brevoApiKey: String,
        senderName: String,
        senderEmail: String,
        adminEmail: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
