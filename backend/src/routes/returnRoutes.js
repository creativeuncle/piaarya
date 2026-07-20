const express = require('express');
const {
  listReturns,
  createReturn,
  updateStatus,
  updatePickupStatus,
  updateRefundStatus,
} = require('../controllers/returnController');
const ReturnRequest = require('../models/ReturnRequest');

const router = express.Router();

router.get('/reasons', (req, res) => res.json(ReturnRequest.RETURN_REASONS));
router.get('/', listReturns);
router.post('/', createReturn);
router.patch('/:id/status', updateStatus);
router.patch('/:id/pickup-status', updatePickupStatus);
router.patch('/:id/refund-status', updateRefundStatus);

module.exports = router;
