const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: String,
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const ORDER_STATUSES = [
  'new',
  'pending',
  'confirmed',
  'processing',
  'delivered',
  'cancelled',
  'returned',
  'refunded',
  'exchange',
];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'new' },
    shippingAddress: { type: Object },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cod', 'stripe'], default: 'cod' },
    paymentReference: {
      gateway: String,
      checkoutSessionId: String,
      paymentIntentId: String,
    },
  },
  { timestamps: true }
);

orderSchema.statics.ORDER_STATUSES = ORDER_STATUSES;

module.exports = mongoose.model('Order', orderSchema);
