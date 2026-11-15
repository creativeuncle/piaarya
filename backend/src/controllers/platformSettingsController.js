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
    });
  } catch (err) {
    next(err);
  }
}

async function updatePaymentSettings(req, res, next) {
  try {
    const { razorpay } = req.body;
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
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPaymentSettings, updatePaymentSettings };
