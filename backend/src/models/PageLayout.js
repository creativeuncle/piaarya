const mongoose = require('mongoose');

// The section "types" a theme page can be built from (Phase 1: Home page
// only, reusing the existing hardcoded supercharged/home components).
const SECTION_TYPES = [
  'hero_slider',
  'categories_slider',
  'trending_products',
  'explore_products',
  'feature_bar',
  'reviews',
  'video_section',
];

const PAGES = ['home'];

const sectionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    type: { type: String, enum: SECTION_TYPES, required: true },
    visible: { type: Boolean, default: true },
    // Per-type settings (e.g. { title, category } for trending_products).
    // Kept schemaless since each section type accepts a different shape —
    // the admin editor and storefront renderer are each responsible for
    // only reading the keys their section type defines.
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  // minimize: false — otherwise Mongoose strips `settings` entirely when
  // it's `{}` (e.g. hero_slider, feature_bar have no fields yet), and the
  // admin editor/storefront would see `section.settings` as undefined
  // instead of an empty object on the next load.
  { _id: false, minimize: false }
);

const pageLayoutSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    page: { type: String, enum: PAGES, required: true },
    sections: { type: [sectionSchema], default: [] },
  },
  { timestamps: true }
);

pageLayoutSchema.index({ store: 1, page: 1 }, { unique: true });

pageLayoutSchema.statics.SECTION_TYPES = SECTION_TYPES;
pageLayoutSchema.statics.PAGES = PAGES;

module.exports = mongoose.model('PageLayout', pageLayoutSchema);
