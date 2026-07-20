const mongoose = require('mongoose');

const RETURN_REASONS = [
  'Wrong item received',
  'Defective/Damaged',
  'Size/Fit issue',
  'Not as described',
  'Changed my mind',
  'Other',
];

const returnItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: String,
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const returnRequestSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    items: [returnItemSchema],
    type: { type: String, enum: ['return', 'exchange'], required: true },
    reason: { type: String, enum: RETURN_REASONS, required: true },
    notes: String,
    status: { type: String, enum: ['requested', 'approved', 'rejected'], default: 'requested' },
    pickupStatus: { type: String, enum: ['not_scheduled', 'scheduled', 'picked_up'], default: 'not_scheduled' },
    refundStatus: { type: String, enum: ['not_applicable', 'pending', 'processed', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

returnRequestSchema.statics.RETURN_REASONS = RETURN_REASONS;

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
