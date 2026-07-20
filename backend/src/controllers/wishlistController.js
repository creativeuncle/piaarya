const Wishlist = require('../models/Wishlist');

async function listWishlist(req, res, next) {
  try {
    const entries = await Wishlist.find()
      .populate('customer', 'name email')
      .populate('product', 'name price')
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    next(err);
  }
}

async function popularProducts(req, res, next) {
  try {
    const results = await Wishlist.aggregate([
      { $group: { _id: '$product', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { count: 1, 'product.name': 1, 'product.price': 1 } },
    ]);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

async function removeEntry(req, res, next) {
  try {
    const entry = await Wishlist.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Wishlist entry not found' });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listWishlist, popularProducts, removeEntry };
