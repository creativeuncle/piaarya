const Settings = require('../models/Settings');
const NotificationLog = require('../models/NotificationLog');

const EVENTS = [
  {
    key: 'order_placed',
    label: 'Order Placed',
    defaultMessage: 'Hi {{customerName}}, your order {{orderNumber}} has been placed successfully. Total: ₹{{amount}}.',
  },
  {
    key: 'order_processing',
    label: 'Order Processing',
    defaultMessage: 'Hi {{customerName}}, your order {{orderNumber}} is now being processed.',
  },
  {
    key: 'order_delivered',
    label: 'Order Delivered',
    defaultMessage: 'Hi {{customerName}}, your order {{orderNumber}} has been delivered. Thank you for shopping with us!',
  },
  {
    key: 'order_cancelled',
    label: 'Order Cancelled',
    defaultMessage: 'Hi {{customerName}}, your order {{orderNumber}} has been cancelled.',
  },
  {
    key: 'refund_processed',
    label: 'Refund Processed',
    defaultMessage: 'Hi {{customerName}}, a refund of ₹{{amount}} for order {{orderNumber}} has been processed.',
  },
  {
    key: 'return_requested',
    label: 'Return Requested',
    defaultMessage: 'Hi {{customerName}}, we have received your return request for order {{orderNumber}}.',
  },
  {
    key: 'exchange_requested',
    label: 'Exchange Requested',
    defaultMessage: 'Hi {{customerName}}, we have received your exchange request for order {{orderNumber}}.',
  },
];

function fillTemplate(template, vars) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => (vars[key] !== undefined ? String(vars[key]) : ''));
}

async function getNotificationSettings() {
  const settings = await Settings.findOne();
  const stored = settings?.notifications || {};

  const channels = {
    email: stored.channels?.email ?? true,
    sms: stored.channels?.sms ?? true,
    whatsapp: stored.channels?.whatsapp ?? true,
  };

  const events = {};
  EVENTS.forEach((e) => {
    const storedEvent = stored.events?.[e.key];
    events[e.key] = {
      enabled: storedEvent?.enabled ?? true,
      message: storedEvent?.message || e.defaultMessage,
    };
  });

  return { channels, events };
}

// Fires a notification for an order/return lifecycle event across whichever
// channels (email/SMS/WhatsApp) are enabled for it. No real email/SMS/WhatsApp
// provider is connected in this project yet, so "sending" is simulated —
// each attempt is recorded as a NotificationLog entry instead of actually
// dispatched, so the trigger points and settings can be wired up now and a
// real provider (SendGrid/Twilio/WhatsApp Business API, etc.) swapped in later
// without changing any of the call sites below.
async function triggerNotification(eventKey, { customer, order, vars }) {
  try {
    const { channels, events } = await getNotificationSettings();
    const event = events[eventKey];
    if (!event || !event.enabled || !customer) return;

    const message = fillTemplate(event.message, vars || {});

    const recipients = [];
    if (channels.email && customer.email) recipients.push({ channel: 'email', to: customer.email });
    if (channels.sms && customer.phone) recipients.push({ channel: 'sms', to: customer.phone });
    if (channels.whatsapp && customer.phone) recipients.push({ channel: 'whatsapp', to: customer.phone });

    await Promise.all(
      recipients.map((r) =>
        NotificationLog.create({
          event: eventKey,
          channel: r.channel,
          recipient: r.to,
          message,
          customer: customer._id,
          order: order?._id,
          status: 'simulated',
        })
      )
    );
  } catch (err) {
    // Notifications must never break the order/return flow they're attached to.
    console.error(`Notification trigger failed for ${eventKey}:`, err.message);
  }
}

module.exports = { EVENTS, getNotificationSettings, triggerNotification };
