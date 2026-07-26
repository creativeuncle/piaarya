const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    paymentGateway: { type: String, enum: ['razorpay', 'stripe'], default: 'razorpay' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
