const express = require('express');
const { listTransactions, refundOrder } = require('../controllers/paymentController');

const router = express.Router();

router.get('/', listTransactions);
router.post('/:orderId/refund', refundOrder);

module.exports = router;
