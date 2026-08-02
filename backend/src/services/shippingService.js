const ShippingZone = require('../models/ShippingZone');

// Matches a state to its zone (falling back to the default/"rest of India"
// zone), then computes each rate's price — 0 if the subtotal clears that
// rate's free-shipping threshold. Used by both the public rate-preview
// endpoint and order creation, so the price actually charged is always
// computed server-side, never trusted from the client.
async function getRatesForState(state, subtotal) {
  const zones = await ShippingZone.find();
  const stateNorm = String(state || '').trim().toLowerCase();

  let zone = zones.find((z) => !z.isDefault && z.states.some((s) => s.toLowerCase() === stateNorm));
  if (!zone) zone = zones.find((z) => z.isDefault);
  if (!zone) return { zoneName: null, rates: [] };

  const rates = zone.rates.map((r) => ({
    label: r.label,
    price: r.freeAboveAmount > 0 && subtotal >= r.freeAboveAmount ? 0 : r.price,
  }));

  return { zoneName: zone.name, rates };
}

module.exports = { getRatesForState };
