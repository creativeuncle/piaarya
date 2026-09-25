const express = require('express');
const { listOrders, getOrder, createOrder, updateOrderStatus, updateOrderTracking, getInvoice, confirmStripeOrder } = require('../controllers/orderController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.get('/', requireAdminAuth, listOrders);
router.post('/', createOrder);
router.get('/stripe/confirm/:sessionId', confirmStripeOrder);
router.get('/:id', requireAdminAuth, getOrder);
router.patch('/:id/status', requireAdminAuth, updateOrderStatus);
router.patch('/:id/tracking', requireAdminAuth, updateOrderTracking);
router.get('/:id/invoice', requireAdminAuth, getInvoice);

module.exports = router;
