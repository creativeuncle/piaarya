const mongoose = require('mongoose');

const SEGMENTS = ['all_customers', 'abandoned_cart', 'no_orders_30d', 'first_time_buyers'];

const whatsAppCampaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    message: { type: String, required: true },
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

whatsAppCampaignSchema.statics.SEGMENTS = SEGMENTS;

module.exports = mongoose.model('WhatsAppCampaign', whatsAppCampaignSchema);
