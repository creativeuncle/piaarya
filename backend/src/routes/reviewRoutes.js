const express = require('express');
const {
  listReviews,
  updateStatus,
  updateReply,
  updateFeatured,
  deleteReview,
} = require('../controllers/reviewController');

const router = express.Router();

router.get('/', listReviews);
router.patch('/:id/status', updateStatus);
router.patch('/:id/reply', updateReply);
router.patch('/:id/featured', updateFeatured);
router.delete('/:id', deleteReview);

module.exports = router;
