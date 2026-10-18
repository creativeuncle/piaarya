const mongoose = require('mongoose');

// A custom domain a store owner has connected (in addition to their default
// <slug>.<CENTRAL_DOMAIN> address). `domain` is unique across the whole
// platform, not per-store — two different stores obviously can't share one.
const domainSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isPrimary: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' },
    sslStatus: { type: String, enum: ['pending', 'active', 'failed'], default: 'pending' },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Domain', domainSchema);
