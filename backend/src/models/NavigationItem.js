const mongoose = require('mongoose');

const navigationItemSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    label: { type: String, required: true, trim: true },
    route: { type: String, required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'NavigationItem', default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NavigationItem', navigationItemSchema);
