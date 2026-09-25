const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    image: { type: String },
    banner: { type: String },
    seoTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

categorySchema.index({ store: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
