const express = require('express');
const {
  listReturns,
  createReturn,
  updateStatus,
  updatePickupStatus,
  updateRefundStatus,
} = require('../controllers/returnController');
const ReturnRequest = require('../models/ReturnRequest');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.get('/reasons', (req, res) => res.json(ReturnRequest.RETURN_REASONS));
router.get('/', requireAdminAuth, listReturns);
router.post('/', createReturn);
router.patch('/:id/status', requireAdminAuth, updateStatus);
router.patch('/:id/pickup-status', requireAdminAuth, updatePickupStatus);
router.patch('/:id/refund-status', requireAdminAuth, updateRefundStatus);

module.exports = router;
