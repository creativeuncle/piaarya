const mongoose = require('mongoose');

const SEGMENTS = ['all_customers', 'abandoned_cart', 'no_orders_30d', 'first_time_buyers'];

const emailCampaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    segment: { type: String, enum: SEGMENTS, default: 'all_customers' },
    status: { type: String, enum: ['draft', 'sent'], default: 'draft' },
    recipientCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    deliveryMode: { type: String, enum: ['live', 'simulated'], default: 'simulated' },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

emailCampaignSchema.statics.SEGMENTS = SEGMENTS;

module.exports = mongoose.model('EmailCampaign', emailCampaignSchema);
