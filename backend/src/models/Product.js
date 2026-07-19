const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    color: String,
    size: String,
    weight: String,
    material: String,
    price: { type: Number, required: true },
    sku: { type: String, required: true },
    stock: { type: Number, default: 0 },
    image: String,
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    sku: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [String],
    description: String,
    specifications: { type: Map, of: String },
    featuredImage: String,
    images: [String],
    videos: [String],
    altText: String,
    variants: [variantSchema],
    seoTitle: String,
    metaDescription: String,
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
