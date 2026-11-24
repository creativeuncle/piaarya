const PlatformSettings = require('../models/PlatformSettings');

function maskSecret(secret) {
  if (!secret) return '';
  if (secret.length <= 4) return '****';
  return `${'*'.repeat(secret.length - 4)}${secret.slice(-4)}`;
}

async function getPaymentSettings(req, res, next) {
  try {
    const settings = await PlatformSettings.findOne();
    res.json({
      razorpay: {
        mode: settings?.razorpay?.mode || 'test',
        keyId: settings?.razorpay?.keyId || '',
        keySecretMasked: maskSecret(settings?.razorpay?.keySecret),
        hasKeySecret: Boolean(settings?.razorpay?.keySecret),
      },
      planPricing: {
        basic: settings?.planPricing?.basic || 0,
        super: settings?.planPricing?.super || 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updatePaymentSettings(req, res, next) {
  try {
    const { razorpay, planPricing } = req.body;
    const existing = await PlatformSettings.findOne();
    const update = {};

    if (razorpay) {
      update.razorpay = {
        mode: razorpay.mode || existing?.razorpay?.mode || 'test',
        keyId: razorpay.keyId !== undefined ? razorpay.keyId : existing?.razorpay?.keyId,
        // Blank secret in the request means "keep the existing one" — the UI
        // never sends the real secret back, only a masked placeholder.
        keySecret: razorpay.keySecret ? razorpay.keySecret : existing?.razorpay?.keySecret,
      };
    }

    if (planPricing) {
      update.planPricing = {
        basic: planPricing.basic !== undefined ? Number(planPricing.basic) || 0 : existing?.planPricing?.basic || 0,
        super: planPricing.super !== undefined ? Number(planPricing.super) || 0 : existing?.planPricing?.super || 0,
      };
    }

    const settings = await PlatformSettings.findOneAndUpdate({}, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    res.json({
      razorpay: {
        mode: settings.razorpay?.mode || 'test',
        keyId: settings.razorpay?.keyId || '',
        keySecretMasked: maskSecret(settings.razorpay?.keySecret),
        hasKeySecret: Boolean(settings.razorpay?.keySecret),
      },
      planPricing: {
        basic: settings.planPricing?.basic || 0,
        super: settings.planPricing?.super || 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getSmsSettings(req, res, next) {
  try {
    const settings = await PlatformSettings.findOne();
    res.json({
      sms: {
        fast2smsApiKeyMasked: maskSecret(settings?.sms?.fast2smsApiKey),
        hasFast2smsApiKey: Boolean(settings?.sms?.fast2smsApiKey),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateSmsSettings(req, res, next) {
  try {
    const { sms } = req.body;
    const existing = await PlatformSettings.findOne();
    const update = {};

    if (sms) {
      update.sms = {
        // Blank API key in the request means "keep the existing one" — the
        // UI never sends the real key back, only a masked placeholder.
        fast2smsApiKey: sms.fast2smsApiKey ? sms.fast2smsApiKey : existing?.sms?.fast2smsApiKey,
      };
    }

    const settings = await PlatformSettings.findOneAndUpdate({}, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    res.json({
      sms: {
        fast2smsApiKeyMasked: maskSecret(settings.sms?.fast2smsApiKey),
        hasFast2smsApiKey: Boolean(settings.sms?.fast2smsApiKey),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPaymentSettings, updatePaymentSettings, getSmsSettings, updateSmsSettings };
