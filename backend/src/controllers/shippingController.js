const ShippingZone = require('../models/ShippingZone');
const { getRatesForState } = require('../services/shippingService');

async function listZones(req, res, next) {
  try {
    const zones = await ShippingZone.find().sort({ isDefault: 1, name: 1 });
    res.json(zones);
  } catch (err) {
    next(err);
  }
}

async function createZone(req, res, next) {
  try {
    const { name, states, isDefault, rates } = req.body;
    const zone = await ShippingZone.create({ name, states: states || [], isDefault: Boolean(isDefault), rates: rates || [] });
    res.status(201).json(zone);
  } catch (err) {
    next(err);
  }
}

async function updateZone(req, res, next) {
  try {
    const { name, states, isDefault, rates } = req.body;
    const zone = await ShippingZone.findByIdAndUpdate(
      req.params.id,
      { name, states: states || [], isDefault: Boolean(isDefault), rates: rates || [] },
      { new: true, runValidators: true }
    );
    if (!zone) return res.status(404).json({ message: 'Shipping zone not found' });
    res.json(zone);
  } catch (err) {
    next(err);
  }
}

async function deleteZone(req, res, next) {
  try {
    const zone = await ShippingZone.findByIdAndDelete(req.params.id);
    if (!zone) return res.status(404).json({ message: 'Shipping zone not found' });
    res.json({ message: 'Shipping zone deleted' });
  } catch (err) {
    next(err);
  }
}

async function calculateShipping(req, res, next) {
  try {
    const { state, subtotal } = req.body;
    const result = await getRatesForState(state, Number(subtotal) || 0);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { listZones, createZone, updateZone, deleteZone, calculateShipping };
