const Settings = require('../models/Settings');
const { GATEWAYS } = require('../services/paymentGateway');

async function getSettings(req, res, next) {
  try {
    const settings = await Settings.findOne();
    res.json({ paymentGateway: settings?.paymentGateway || 'razorpay' });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const { paymentGateway } = req.body;
    if (!GATEWAYS.includes(paymentGateway)) {
      return res.status(400).json({ message: `paymentGateway must be one of: ${GATEWAYS.join(', ')}` });
    }
    const settings = await Settings.findOneAndUpdate(
      {},
      { paymentGateway },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ paymentGateway: settings.paymentGateway });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, updateSettings };
