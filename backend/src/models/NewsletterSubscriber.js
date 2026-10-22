const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true }
);

newsletterSubscriberSchema.index({ store: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
