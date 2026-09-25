const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    initialBalance: { type: Number, required: true },
    balance: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    note: { type: String },
    issuedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  },
  { timestamps: true }
);

giftCardSchema.index({ store: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('GiftCard', giftCardSchema);
