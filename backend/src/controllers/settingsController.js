const Settings = require('../models/Settings');
const { GATEWAYS } = require('../services/paymentGateway');

function maskSecret(secret) {
  if (!secret) return '';
  if (secret.length <= 4) return '****';
  return `${'*'.repeat(secret.length - 4)}${secret.slice(-4)}`;
}

function toPublicSettings(settings) {
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
  };
}

async function getSettings(req, res, next) {
  try {
    const settings = await Settings.findOne();
    res.json(toPublicSettings(settings));
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const { paymentGateway, razorpay, stripe } = req.body;

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

    const settings = await Settings.findOneAndUpdate({}, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    res.json(toPublicSettings(settings));
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, updateSettings };
