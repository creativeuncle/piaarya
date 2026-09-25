const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    content: { type: String, default: '' },
    seoTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

pageSchema.index({ store: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Page', pageSchema);
