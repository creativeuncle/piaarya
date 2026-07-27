const Review = require('../models/Review');

async function listReviews(req, res, next) {
  try {
    const { status, featured, product, tag, sort } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (featured === 'true') filter.isFeatured = true;
    if (product) filter.product = product;
    if (tag) filter.tags = tag;

    const sortOption = sort === 'recent' ? { createdAt: -1 } : sort === 'helpful' ? { helpfulCount: -1, createdAt: -1 } : { createdAt: -1 };

    const reviews = await Review.find(filter)
      .populate('product', 'name')
      .populate('customer', 'name')
      .sort(sortOption);

    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('product', 'name')
      .populate('customer', 'name');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    next(err);
  }
}

async function updateReply(req, res, next) {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { reply: req.body.reply }, { new: true })
      .populate('product', 'name')
      .populate('customer', 'name');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    next(err);
  }
}

async function updateFeatured(req, res, next) {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isFeatured: req.body.isFeatured },
      { new: true }
    )
      .populate('product', 'name')
      .populate('customer', 'name');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    next(err);
  }
}

async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listReviews, updateStatus, updateReply, updateFeatured, deleteReview };
