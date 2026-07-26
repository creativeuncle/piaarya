const express = require('express');
const { listOrders, getOrder, createOrder, updateOrderStatus, getInvoice } = require('../controllers/orderController');

const router = express.Router();

router.get('/', listOrders);
router.post('/', createOrder);
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatus);
router.get('/:id/invoice', getInvoice);

module.exports = router;
