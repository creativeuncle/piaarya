const express = require('express');
const { listTransactions, refundOrder } = require('../controllers/paymentController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/', listTransactions);
router.post('/:orderId/refund', refundOrder);

module.exports = router;
