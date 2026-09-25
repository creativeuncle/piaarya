const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: true }
);

wishlistSchema.index({ store: 1, customer: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
