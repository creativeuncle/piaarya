const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    label: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: String,
    passwordHash: { type: String, required: true },
    addresses: [addressSchema],
    rewardPoints: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    otpCode: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
