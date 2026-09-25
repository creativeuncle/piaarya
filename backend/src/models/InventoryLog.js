const mongoose = require('mongoose');

const INVENTORY_LOG_TYPES = ['stock', 'damaged', 'reserved'];

const inventoryLogSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: INVENTORY_LOG_TYPES, required: true },
    quantityChange: { type: Number, required: true },
    previousValue: { type: Number, required: true },
    newValue: { type: Number, required: true },
    reason: { type: String },
  },
  { timestamps: true }
);

inventoryLogSchema.statics.INVENTORY_LOG_TYPES = INVENTORY_LOG_TYPES;

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
