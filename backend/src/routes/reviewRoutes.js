const express = require('express');
const {
  createReview,
  listReviews,
  updateStatus,
  updateReply,
  updateFeatured,
  deleteReview,
} = require('../controllers/reviewController');
const Review = require('../models/Review');
const { requireAuth } = require('../middleware/auth');
const { requireAdminAuth, optionalAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.get('/tags', (req, res) => res.json(Review.REVIEW_TAGS));
// Shared by storefront-next (public, approved reviews only) and admin-next
// (full moderation queue, any status) — the controller enforces the
// approved-only restriction for non-admin callers.
router.get('/', optionalAdminAuth, listReviews);
router.post('/', requireAuth, createReview);
router.patch('/:id/status', requireAdminAuth, updateStatus);
router.patch('/:id/reply', requireAdminAuth, updateReply);
router.patch('/:id/featured', requireAdminAuth, updateFeatured);
router.delete('/:id', requireAdminAuth, deleteReview);

module.exports = router;
