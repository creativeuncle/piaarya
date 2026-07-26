const Wishlist = require('../models/Wishlist');

async function listWishlist(req, res, next) {
  try {
    const { productId, category } = req.query;
    const filter = {};
    if (productId) filter.product = productId;

    let entries = await Wishlist.find(filter)
      .populate('customer', 'name email')
      .populate({ path: 'product', select: 'name price media category', populate: { path: 'category', select: 'name' } })
      .sort({ createdAt: -1 });

    if (category) {
      entries = entries.filter((entry) => String(entry.product?.category?._id || '') === category);
    }

    res.json(entries);
  } catch (err) {
    next(err);
  }
}

async function getMyWishlist(req, res, next) {
  try {
    const entries = await Wishlist.find({ customer: req.customerId })
      .populate({ path: 'product', select: 'name price media category', populate: { path: 'category', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    next(err);
  }
}

async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    const entry = await Wishlist.findOneAndUpdate(
      { customer: req.customerId, product: productId },
      { customer: req.customerId, product: productId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

async function removeFromWishlistByProduct(req, res, next) {
  try {
    await Wishlist.findOneAndDelete({ customer: req.customerId, product: req.params.productId });
    res.json({ message: 'Removed from wishlist' });
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

module.exports = {
  listWishlist,
  getMyWishlist,
  addToWishlist,
  removeFromWishlistByProduct,
  popularProducts,
  removeEntry,
};
