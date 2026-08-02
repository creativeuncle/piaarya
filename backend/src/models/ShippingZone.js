const mongoose = require('mongoose');

const shippingRateSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    price: { type: Number, required: true, default: 0 },
    freeAboveAmount: { type: Number, default: 0 },
  },
  { _id: false }
);

const shippingZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    states: [{ type: String, trim: true }],
    isDefault: { type: Boolean, default: false },
    rates: [shippingRateSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShippingZone', shippingZoneSchema);
