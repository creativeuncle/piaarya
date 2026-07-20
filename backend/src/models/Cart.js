const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: String,
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [cartItemSchema],
    status: { type: String, enum: ['active', 'abandoned', 'recovered', 'converted'], default: 'active' },
    lastActivityAt: { type: Date, default: Date.now },
    recoveryEmailCount: { type: Number, default: 0 },
    recoveryEmailSentAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
