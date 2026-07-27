const mongoose = require('mongoose');

const REVIEW_TAGS = ['Product Quality', 'Color', 'Material', 'Fit', 'Value For Money'];

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    images: [String],
    tags: [{ type: String, enum: REVIEW_TAGS }],
    isVerifiedBuyer: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reply: String,
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.statics.REVIEW_TAGS = REVIEW_TAGS;

module.exports = mongoose.model('Review', reviewSchema);
