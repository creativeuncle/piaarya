const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    initialBalance: { type: Number, required: true },
    balance: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    note: { type: String },
    issuedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GiftCard', giftCardSchema);
