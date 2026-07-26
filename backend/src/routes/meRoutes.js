const express = require('express');
const {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getOrders,
  getOrderById,
  cancelOrder,
  getRequests,
} = require('../controllers/meController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getProfile);
router.put('/', updateProfile);
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:index', updateAddress);
router.delete('/addresses/:index', deleteAddress);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/cancel', cancelOrder);
router.get('/requests', getRequests);

module.exports = router;
