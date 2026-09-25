const mongoose = require('mongoose');

const installedAppSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    key: { type: String, required: true, trim: true },
    isEnabled: { type: Boolean, default: true },
    installedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

installedAppSchema.index({ store: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('InstalledApp', installedAppSchema);
