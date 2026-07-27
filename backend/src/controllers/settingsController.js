const Settings = require('../models/Settings');
const NotificationLog = require('../models/NotificationLog');
const { GATEWAYS } = require('../services/paymentGateway');
const { EVENTS: NOTIFICATION_EVENTS, getNotificationSettings } = require('../services/notificationService');

function maskSecret(secret) {
  if (!secret) return '';
  if (secret.length <= 4) return '****';
  return `${'*'.repeat(secret.length - 4)}${secret.slice(-4)}`;
}

async function toPublicSettings(settings) {
  const notifications = await getNotificationSettings();
  notifications.email = {
    brevoApiKeyMasked: maskSecret(settings?.notifications?.email?.brevoApiKey),
    hasBrevoApiKey: Boolean(settings?.notifications?.email?.brevoApiKey),
    senderName: settings?.notifications?.email?.senderName || '',
    senderEmail: settings?.notifications?.email?.senderEmail || '',
    adminEmail: settings?.notifications?.email?.adminEmail || '',
  };

  return {
    paymentGateway: settings?.paymentGateway || 'razorpay',
    razorpay: {
      mode: settings?.razorpay?.mode || 'test',
      keyId: settings?.razorpay?.keyId || '',
      keySecretMasked: maskSecret(settings?.razorpay?.keySecret),
      hasKeySecret: Boolean(settings?.razorpay?.keySecret),
    },
    stripe: {
      mode: settings?.stripe?.mode || 'test',
      publishableKey: settings?.stripe?.publishableKey || '',
      secretKeyMasked: maskSecret(settings?.stripe?.secretKey),
      hasSecretKey: Boolean(settings?.stripe?.secretKey),
    },
    notifications,
    notificationEventDefinitions: NOTIFICATION_EVENTS.map((e) => ({ key: e.key, label: e.label })),
  };
}

async function getSettings(req, res, next) {
  try {
    const settings = await Settings.findOne();
    res.json(await toPublicSettings(settings));
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const { paymentGateway, razorpay, stripe, notifications } = req.body;

    if (paymentGateway && !GATEWAYS.includes(paymentGateway)) {
      return res.status(400).json({ message: `paymentGateway must be one of: ${GATEWAYS.join(', ')}` });
    }

    const existing = await Settings.findOne();
    const update = {};
    if (paymentGateway) update.paymentGateway = paymentGateway;

    if (razorpay) {
      update.razorpay = {
        mode: razorpay.mode || existing?.razorpay?.mode || 'test',
        keyId: razorpay.keyId !== undefined ? razorpay.keyId : existing?.razorpay?.keyId,
        // Blank secret in the request means "keep the existing one" — the UI never
        // sends the real secret back, only a masked placeholder.
        keySecret: razorpay.keySecret ? razorpay.keySecret : existing?.razorpay?.keySecret,
      };
    }

    if (stripe) {
      update.stripe = {
        mode: stripe.mode || existing?.stripe?.mode || 'test',
        publishableKey: stripe.publishableKey !== undefined ? stripe.publishableKey : existing?.stripe?.publishableKey,
        secretKey: stripe.secretKey ? stripe.secretKey : existing?.stripe?.secretKey,
      };
    }

    if (notifications) {
      const validKeys = NOTIFICATION_EVENTS.map((e) => e.key);
      const events = { ...(existing?.notifications?.events || {}) };
      if (notifications.events) {
        Object.entries(notifications.events).forEach(([key, value]) => {
          if (!validKeys.includes(key)) return;
          events[key] = {
            enabled: Boolean(value.enabled),
            message: value.message || '',
          };
        });
      }

      update.notifications = {
        channels: {
          email: notifications.channels?.email ?? existing?.notifications?.channels?.email ?? true,
          sms: notifications.channels?.sms ?? existing?.notifications?.channels?.sms ?? true,
          whatsapp: notifications.channels?.whatsapp ?? existing?.notifications?.channels?.whatsapp ?? true,
        },
        events,
        email: {
          senderName:
            notifications.email?.senderName !== undefined
              ? notifications.email.senderName
              : existing?.notifications?.email?.senderName,
          senderEmail:
            notifications.email?.senderEmail !== undefined
              ? notifications.email.senderEmail
              : existing?.notifications?.email?.senderEmail,
          adminEmail:
            notifications.email?.adminEmail !== undefined
              ? notifications.email.adminEmail
              : existing?.notifications?.email?.adminEmail,
          // Blank API key in the request means "keep the existing one" — the UI
          // never sends the real key back, only a masked placeholder.
          brevoApiKey: notifications.email?.brevoApiKey
            ? notifications.email.brevoApiKey
            : existing?.notifications?.email?.brevoApiKey,
        },
      };
    }

    const settings = await Settings.findOneAndUpdate({}, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    res.json(await toPublicSettings(settings));
  } catch (err) {
    next(err);
  }
}

async function listNotificationLogs(req, res, next) {
  try {
    const logs = await NotificationLog.find()
      .populate('customer', 'name email')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, updateSettings, listNotificationLogs };
