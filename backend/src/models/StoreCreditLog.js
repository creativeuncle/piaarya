const mongoose = require('mongoose');

const storeCreditLogSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    amountChange: { type: Number, required: true },
    previousValue: { type: Number, required: true },
    newValue: { type: Number, required: true },
    reason: { type: String },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StoreCreditLog', storeCreditLogSchema);
