const express = require('express');
const {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  deleteAddress,
  getOrders,
  getRequests,
} = require('../controllers/meController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getProfile);
router.put('/', updateProfile);
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.delete('/addresses/:index', deleteAddress);
router.get('/orders', getOrders);
router.get('/requests', getRequests);

module.exports = router;
