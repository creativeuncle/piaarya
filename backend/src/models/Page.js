const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    content: { type: String, default: '' },
    seoTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Page', pageSchema);
