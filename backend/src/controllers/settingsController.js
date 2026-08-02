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
  notifications.sms = {
    fast2smsApiKeyMasked: maskSecret(settings?.notifications?.sms?.fast2smsApiKey),
    hasFast2smsApiKey: Boolean(settings?.notifications?.sms?.fast2smsApiKey),
    adminPhone: settings?.notifications?.sms?.adminPhone || '',
  };

  const socialLogin = {
    google: {
      enabled: settings?.socialLogin?.google?.enabled || false,
      clientId: settings?.socialLogin?.google?.clientId || '',
      clientSecretMasked: maskSecret(settings?.socialLogin?.google?.clientSecret),
      hasClientSecret: Boolean(settings?.socialLogin?.google?.clientSecret),
    },
    facebook: {
      enabled: settings?.socialLogin?.facebook?.enabled || false,
      appId: settings?.socialLogin?.facebook?.appId || '',
      appSecretMasked: maskSecret(settings?.socialLogin?.facebook?.appSecret),
      hasAppSecret: Boolean(settings?.socialLogin?.facebook?.appSecret),
    },
    apple: {
      enabled: settings?.socialLogin?.apple?.enabled || false,
      servicesId: settings?.socialLogin?.apple?.servicesId || '',
      teamId: settings?.socialLogin?.apple?.teamId || '',
      keyId: settings?.socialLogin?.apple?.keyId || '',
      privateKeyMasked: maskSecret(settings?.socialLogin?.apple?.privateKey),
      hasPrivateKey: Boolean(settings?.socialLogin?.apple?.privateKey),
    },
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
    socialLogin,
    tax: {
      gstEnabled: settings?.tax?.gstEnabled || false,
      pricesIncludeTax: settings?.tax?.pricesIncludeTax ?? true,
      gstin: settings?.tax?.gstin || '',
      legalBusinessName: settings?.tax?.legalBusinessName || '',
      sellerState: settings?.tax?.sellerState || '',
      defaultGstRate: settings?.tax?.defaultGstRate ?? 18,
    },
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
    const { paymentGateway, razorpay, stripe, notifications, socialLogin, tax } = req.body;

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
        sms: {
          adminPhone:
            notifications.sms?.adminPhone !== undefined
              ? notifications.sms.adminPhone
              : existing?.notifications?.sms?.adminPhone,
          // Blank API key in the request means "keep the existing one" — the UI
          // never sends the real key back, only a masked placeholder.
          fast2smsApiKey: notifications.sms?.fast2smsApiKey
            ? notifications.sms.fast2smsApiKey
            : existing?.notifications?.sms?.fast2smsApiKey,
        },
      };
    }

    if (socialLogin) {
      update.socialLogin = {
        google: {
          enabled: socialLogin.google?.enabled ?? existing?.socialLogin?.google?.enabled ?? false,
          clientId:
            socialLogin.google?.clientId !== undefined
              ? socialLogin.google.clientId
              : existing?.socialLogin?.google?.clientId,
          // Blank secret in the request means "keep the existing one" — the UI never
          // sends the real secret back, only a masked placeholder.
          clientSecret: socialLogin.google?.clientSecret
            ? socialLogin.google.clientSecret
            : existing?.socialLogin?.google?.clientSecret,
        },
        facebook: {
          enabled: socialLogin.facebook?.enabled ?? existing?.socialLogin?.facebook?.enabled ?? false,
          appId:
            socialLogin.facebook?.appId !== undefined
              ? socialLogin.facebook.appId
              : existing?.socialLogin?.facebook?.appId,
          appSecret: socialLogin.facebook?.appSecret
            ? socialLogin.facebook.appSecret
            : existing?.socialLogin?.facebook?.appSecret,
        },
        apple: {
          enabled: socialLogin.apple?.enabled ?? existing?.socialLogin?.apple?.enabled ?? false,
          servicesId:
            socialLogin.apple?.servicesId !== undefined
              ? socialLogin.apple.servicesId
              : existing?.socialLogin?.apple?.servicesId,
          teamId:
            socialLogin.apple?.teamId !== undefined ? socialLogin.apple.teamId : existing?.socialLogin?.apple?.teamId,
          keyId:
            socialLogin.apple?.keyId !== undefined ? socialLogin.apple.keyId : existing?.socialLogin?.apple?.keyId,
          privateKey: socialLogin.apple?.privateKey
            ? socialLogin.apple.privateKey
            : existing?.socialLogin?.apple?.privateKey,
        },
      };
    }

    if (tax) {
      update.tax = {
        gstEnabled: tax.gstEnabled ?? existing?.tax?.gstEnabled ?? false,
        pricesIncludeTax: tax.pricesIncludeTax ?? existing?.tax?.pricesIncludeTax ?? true,
        gstin: tax.gstin !== undefined ? tax.gstin : existing?.tax?.gstin,
        legalBusinessName: tax.legalBusinessName !== undefined ? tax.legalBusinessName : existing?.tax?.legalBusinessName,
        sellerState: tax.sellerState !== undefined ? tax.sellerState : existing?.tax?.sellerState,
        defaultGstRate: tax.defaultGstRate !== undefined ? tax.defaultGstRate : existing?.tax?.defaultGstRate,
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
