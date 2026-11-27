const Cart = require('../models/Cart');

// Called by the storefront whenever the logged-in customer's cart changes
// (add/remove/update quantity), debounced client-side. Keeps a server-side
// mirror of the cart so it can be detected as "abandoned" and recovered —
// guest (not-logged-in) carts have no email/phone to recover with, so they
// are never synced here.
async function syncCart(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ message: 'items must be an array' });

    if (items.length === 0) {
      await Cart.findOneAndDelete({ customer: req.customerId, status: { $in: ['active', 'abandoned'] } });
      return res.json({ message: 'Cart cleared' });
    }

    const cart = await Cart.findOneAndUpdate(
      { customer: req.customerId, status: { $in: ['active', 'abandoned'] } },
      {
        customer: req.customerId,
        items: items.map((i) => ({
          product: i.productId,
          variantSku: i.variantSku || undefined,
          quantity: i.quantity,
          price: i.price,
        })),
        status: 'active',
        lastActivityAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

module.exports = { syncCart };
