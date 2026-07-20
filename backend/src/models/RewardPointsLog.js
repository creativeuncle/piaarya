const mongoose = require('mongoose');

const rewardPointsLogSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    pointsChange: { type: Number, required: true },
    previousValue: { type: Number, required: true },
    newValue: { type: Number, required: true },
    reason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RewardPointsLog', rewardPointsLogSchema);
