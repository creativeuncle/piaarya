const mongoose = require('mongoose');

const DISCOUNT_TYPES = ['fixed', 'percentage', 'buy_x_get_y'];
const APPLIES_TO = ['all', 'category', 'product'];

const couponSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String },
    discountType: { type: String, enum: DISCOUNT_TYPES, required: true },
    discountValue: { type: Number },
    buyQuantity: { type: Number },
    getQuantity: { type: Number },
    appliesTo: { type: String, enum: APPLIES_TO, default: 'all' },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    firstOrderOnly: { type: Boolean, default: false },
    autoApply: { type: Boolean, default: false },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.index({ store: 1, code: 1 }, { unique: true });

couponSchema.statics.DISCOUNT_TYPES = DISCOUNT_TYPES;
couponSchema.statics.APPLIES_TO = APPLIES_TO;

module.exports = mongoose.model('Coupon', couponSchema);
