const express = require('express');
const { listOrders, getOrder, createOrder, updateOrderStatus, getInvoice, confirmStripeOrder } = require('../controllers/orderController');

const router = express.Router();

router.get('/', listOrders);
router.post('/', createOrder);
router.get('/stripe/confirm/:sessionId', confirmStripeOrder);
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatus);
router.get('/:id/invoice', getInvoice);

module.exports = router;
