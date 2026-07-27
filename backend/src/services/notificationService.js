const Settings = require('../models/Settings');
const NotificationLog = require('../models/NotificationLog');

const EVENTS = [
  {
    key: 'order_placed',
    label: 'Order Placed',
    defaultSubject: 'Your order {{orderNumber}} has been placed',
    defaultMessage: 'Hi {{customerName}}, your order {{orderNumber}} has been placed successfully. Total: ₹{{amount}}.',
  },
  {
    key: 'order_processing',
    label: 'Order Processing',
    defaultSubject: 'Your order {{orderNumber}} is being processed',
    defaultMessage: 'Hi {{customerName}}, your order {{orderNumber}} is now being processed.',
  },
  {
    key: 'order_delivered',
    label: 'Order Delivered',
    defaultSubject: 'Your order {{orderNumber}} has been delivered',
    defaultMessage: 'Hi {{customerName}}, your order {{orderNumber}} has been delivered. Thank you for shopping with us!',
  },
  {
    key: 'order_cancelled',
    label: 'Order Cancelled',
    defaultSubject: 'Your order {{orderNumber}} has been cancelled',
    defaultMessage: 'Hi {{customerName}}, your order {{orderNumber}} has been cancelled.',
  },
  {
    key: 'refund_processed',
    label: 'Refund Processed',
    defaultSubject: 'Refund processed for order {{orderNumber}}',
    defaultMessage: 'Hi {{customerName}}, a refund of ₹{{amount}} for order {{orderNumber}} has been processed.',
  },
  {
    key: 'return_requested',
    label: 'Return Requested',
    defaultSubject: 'Return request received for order {{orderNumber}}',
    defaultMessage: 'Hi {{customerName}}, we have received your return request for order {{orderNumber}}.',
  },
  {
    key: 'exchange_requested',
    label: 'Exchange Requested',
    defaultSubject: 'Exchange request received for order {{orderNumber}}',
    defaultMessage: 'Hi {{customerName}}, we have received your exchange request for order {{orderNumber}}.',
  },
];

// Events the store admin also gets an email copy of, per the merchant's request.
const ADMIN_COPY_EVENTS = ['order_placed', 'order_processing', 'order_delivered', 'return_requested', 'exchange_requested'];

function fillTemplate(template, vars) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => (vars[key] !== undefined ? String(vars[key]) : ''));
}

// Fast2SMS expects a bare 10-digit Indian mobile number, no country code / symbols.
function formatIndianMobile(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.slice(-10);
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

// Sends a transactional email through Brevo's REST API. Requires a Brevo API
// key and a sender email verified in the Brevo account (Settings > Notifications).
async function sendBrevoEmail({ apiKey, senderName, senderEmail, to, toName, subject, text }) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName || 'Piaarya', email: senderEmail },
      to: [{ email: to, name: toName || undefined }],
      subject,
      textContent: text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brevo API error ${response.status}: ${body}`);
  }

  return response.json();
}

// Sends a plain transactional SMS through Fast2SMS's Quick SMS route. Requires
// a Fast2SMS API key (Settings > Notifications). Note: for production-grade
// delivery of custom text in India, Fast2SMS/TRAI generally requires a
// DLT-registered sender ID + template — if sends fail with a DLT-related
// error, that registration needs to happen on the Fast2SMS side.
async function sendFast2SmsMessage({ apiKey, phone, message }) {
  const number = formatIndianMobile(phone);
  const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ route: 'q', message, language: 'english', flash: 0, numbers: number }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.return !== true) {
    throw new Error(`Fast2SMS error: ${data.message || response.statusText}`);
  }
  return data;
}

// Sends a one-time-password via Fast2SMS's dedicated OTP route.
async function sendFast2SmsOtp({ apiKey, phone, otp }) {
  const number = formatIndianMobile(phone);
  const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=otp&variables_values=${otp}&flash=0&numbers=${number}`;
  const response = await fetch(url, { method: 'GET' });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.return !== true) {
    throw new Error(`Fast2SMS error: ${data.message || response.statusText}`);
  }
  return data;
}

// Standalone helper used by the login-with-OTP flow. Returns true if a real
// SMS was sent, false if Fast2SMS isn't configured yet (caller should fall
// back to returning the OTP in the response for testing, as before).
async function sendOtpSms(phone, otp) {
  const settings = await Settings.findOne();
  const apiKey = settings?.notifications?.sms?.fast2smsApiKey;
  if (!apiKey || !phone) return false;

  await sendFast2SmsOtp({ apiKey, phone, otp });
  return true;
}

async function dispatch(recipient, ctx) {
  let status = 'simulated';

  if (recipient.channel === 'email' && ctx.canSendRealEmail) {
    try {
      await sendBrevoEmail({
        apiKey: ctx.emailConfig.brevoApiKey,
        senderName: ctx.emailConfig.senderName,
        senderEmail: ctx.emailConfig.senderEmail,
        to: recipient.to,
        toName: recipient.toName,
        subject: ctx.subject,
        text: ctx.message,
      });
      status = 'sent';
    } catch (err) {
      status = 'failed';
      console.error(`Brevo email send failed for ${ctx.eventKey}:`, err.message);
    }
  }

  if (recipient.channel === 'sms' && ctx.canSendRealSms) {
    try {
      await sendFast2SmsMessage({ apiKey: ctx.smsConfig.fast2smsApiKey, phone: recipient.to, message: ctx.message });
      status = 'sent';
    } catch (err) {
      status = 'failed';
      console.error(`Fast2SMS send failed for ${ctx.eventKey}:`, err.message);
    }
  }

  await NotificationLog.create({
    event: ctx.eventKey,
    channel: recipient.channel,
    recipient: recipient.to,
    message: ctx.message,
    customer: ctx.customer?._id,
    order: ctx.order?._id,
    status,
  });
}

// Fires a notification for an order/return lifecycle event across whichever
// channels (email/SMS/WhatsApp) are enabled for it. Email actually sends via
// Brevo once an API key + sender email are configured in Settings >
// Notifications; SMS and WhatsApp have no live provider connected yet, so
// those (and email without a configured key) are recorded as simulated
// NotificationLog entries instead of dispatched — swapping in a real SMS/
// WhatsApp provider later only touches the dispatch() function above.
async function triggerNotification(eventKey, { customer, order, vars }) {
  try {
    const settings = await Settings.findOne();
    const stored = settings?.notifications || {};
    const channels = {
      email: stored.channels?.email ?? true,
      sms: stored.channels?.sms ?? true,
      whatsapp: stored.channels?.whatsapp ?? true,
    };

    const eventDef = EVENTS.find((e) => e.key === eventKey);
    const storedEvent = stored.events?.[eventKey];
    const enabled = storedEvent?.enabled ?? true;
    if (!eventDef || !enabled) return;

    const message = fillTemplate(storedEvent?.message || eventDef.defaultMessage, vars || {});
    const subject = fillTemplate(eventDef.defaultSubject, vars || {});

    const emailConfig = stored.email || {};
    const canSendRealEmail = Boolean(emailConfig.brevoApiKey && emailConfig.senderEmail);
    const smsConfig = stored.sms || {};
    const canSendRealSms = Boolean(smsConfig.fast2smsApiKey);

    const recipients = [];
    if (customer) {
      if (channels.email && customer.email) recipients.push({ channel: 'email', to: customer.email, toName: customer.name });
      if (channels.sms && customer.phone) recipients.push({ channel: 'sms', to: customer.phone });
      if (channels.whatsapp && customer.phone) recipients.push({ channel: 'whatsapp', to: customer.phone });
    }

    const ctx = { eventKey, message, subject, customer, order, emailConfig, canSendRealEmail, smsConfig, canSendRealSms };
    await Promise.all(recipients.map((r) => dispatch(r, ctx)));

    if (ADMIN_COPY_EVENTS.includes(eventKey)) {
      if (channels.email && emailConfig.adminEmail) {
        await dispatch(
          { channel: 'email', to: emailConfig.adminEmail, toName: 'Admin' },
          { ...ctx, subject: `[Admin] ${subject}` }
        );
      }
      if (channels.sms && smsConfig.adminPhone) {
        await dispatch({ channel: 'sms', to: smsConfig.adminPhone }, ctx);
      }
    }
  } catch (err) {
    // Notifications must never break the order/return flow they're attached to.
    console.error(`Notification trigger failed for ${eventKey}:`, err.message);
  }
}

module.exports = { EVENTS, getNotificationSettings, triggerNotification, sendOtpSms };
