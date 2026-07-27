const Review = require('../models/Review');
const Order = require('../models/Order');

async function createReview(req, res, next) {
  try {
    const { product, rating, comment, images, tags } = req.body;

    if (!product || !rating) {
      return res.status(400).json({ message: 'product and rating are required' });
    }
    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'rating must be between 1 and 5' });
    }

    const validTags = Review.REVIEW_TAGS;
    const cleanTags = Array.isArray(tags) ? tags.filter((t) => validTags.includes(t)) : [];
    const cleanImages = Array.isArray(images) ? images.slice(0, 6) : [];

    const isVerifiedBuyer = Boolean(
      await Order.findOne({ customer: req.customerId, 'items.product': product })
    );

    const review = await Review.create({
      product,
      customer: req.customerId,
      rating: ratingNum,
      comment,
      images: cleanImages,
      tags: cleanTags,
      isVerifiedBuyer,
      status: 'pending',
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

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

module.exports = { createReview, listReviews, updateStatus, updateReply, updateFeatured, deleteReview };
