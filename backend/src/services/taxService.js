const Settings = require('../models/Settings');

// Indian D2C stores usually show a single GST-inclusive price (the price the
// customer sees already has GST built in), so by default this reverse-
// calculates the taxable value and tax amount out of each item's price
// rather than adding tax on top — controlled by tax.pricesIncludeTax in
// Settings. Splits the tax into CGST+SGST (buyer and seller in the same
// state) or IGST (different states), per Indian GST rules.
async function computeOrderTax(orderItems, shippingState) {
  const settings = await Settings.findOne();
  const taxConfig = settings?.tax || {};

  if (!taxConfig.gstEnabled) {
    return { taxableAmount: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0, taxType: null };
  }

  let taxableAmount = 0;
  let totalTax = 0;

  orderItems.forEach((item) => {
    const rate = item.gstRate || taxConfig.defaultGstRate || 0;
    const lineTotal = item.price * item.quantity;
    if (taxConfig.pricesIncludeTax) {
      const taxable = lineTotal / (1 + rate / 100);
      taxableAmount += taxable;
      totalTax += lineTotal - taxable;
    } else {
      taxableAmount += lineTotal;
      totalTax += (lineTotal * rate) / 100;
    }
  });

  const sellerState = String(taxConfig.sellerState || '').trim().toLowerCase();
  const buyerState = String(shippingState || '').trim().toLowerCase();
  const isIntraState = Boolean(sellerState && buyerState && sellerState === buyerState);

  const round = (n) => Math.round(n * 100) / 100;

  return {
    taxableAmount: round(taxableAmount),
    cgst: isIntraState ? round(totalTax / 2) : 0,
    sgst: isIntraState ? round(totalTax / 2) : 0,
    igst: !isIntraState ? round(totalTax) : 0,
    totalTax: round(totalTax),
    taxType: isIntraState ? 'intra_state' : 'inter_state',
    pricesIncludeTax: taxConfig.pricesIncludeTax,
  };
}

module.exports = { computeOrderTax };
