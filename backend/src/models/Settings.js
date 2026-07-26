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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
