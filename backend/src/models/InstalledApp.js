const mongoose = require('mongoose');

const installedAppSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    isEnabled: { type: Boolean, default: true },
    installedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InstalledApp', installedAppSchema);
