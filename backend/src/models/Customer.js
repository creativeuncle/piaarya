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
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    // Optional: a customer who signed up via phone+OTP has no email/password
    // until they choose to add one from their profile.
    name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String },
    addresses: [addressSchema],
    rewardPoints: { type: Number, default: 0 },
    storeCredit: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    otpCode: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

// sparse: a customer without an email (phone-only signup) or without a
// phone (email/password signup) doesn't collide with others missing the
// same field.
customerSchema.index({ store: 1, email: 1 }, { unique: true, sparse: true });
customerSchema.index({ store: 1, phone: 1 }, { unique: true, sparse: true });

// Always store a bare 10-digit number, however it was typed (with a country
// code, spaces, dashes, etc.), so phone+OTP login can look it up by an exact
// match instead of a fragile suffix regex. Covers both .save() and
// findOneAndUpdate/findByIdAndUpdate (e.g. the customer profile edit form,
// which doesn't go through .save()).
function normalizePhone(phone) {
  return String(phone).replace(/\D/g, '').slice(-10);
}

customerSchema.pre('save', function (next) {
  if (this.isModified('phone') && this.phone) {
    this.phone = normalizePhone(this.phone);
  }
  next();
});

customerSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update?.phone) update.phone = normalizePhone(update.phone);
  if (update?.$set?.phone) update.$set.phone = normalizePhone(update.$set.phone);
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
