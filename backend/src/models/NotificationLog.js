const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    channel: { type: String, enum: ['email', 'sms', 'whatsapp'], required: true },
    recipient: { type: String, required: true },
    message: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    status: { type: String, enum: ['simulated', 'sent', 'failed'], default: 'simulated' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
