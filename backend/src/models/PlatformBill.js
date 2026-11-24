const mongoose = require('mongoose');

// A single issued bill for a store's CartDodo subscription (Basic/Super
// plan). Tenant-scoped (has a `store` field), unlike PlatformSettings. Rows
// here are only ever written once a billing cycle actually closes and is
// charged — this is history, not a projection, so it's never backfilled
// with fabricated data.
const BILL_STATUSES = ['paid', 'open', 'processing', 'failed', 'refunded', 'canceled'];

const platformBillSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    billNumber: { type: String, required: true },
    billType: { type: String, default: 'Billing cycle' },
    cycleStart: { type: Date, required: true },
    cycleEnd: { type: Date, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: BILL_STATUSES, default: 'open' },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

platformBillSchema.index({ store: 1, billNumber: 1 }, { unique: true });
platformBillSchema.statics.BILL_STATUSES = BILL_STATUSES;

module.exports = mongoose.model('PlatformBill', platformBillSchema);
