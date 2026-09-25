const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
  },
  { timestamps: true }
);

warehouseSchema.index({ store: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);
