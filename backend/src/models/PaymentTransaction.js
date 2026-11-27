const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    type: { type: String, enum: ['charge', 'refund', 'partial_refund'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    method: { type: String },
    reason: { type: String },
    // Set on a refund processed via processRefund() — the real gateway
    // refund id (or a SIMULATED-* placeholder when no gateway is configured).
    gatewayReference: { type: String },
    simulated: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
