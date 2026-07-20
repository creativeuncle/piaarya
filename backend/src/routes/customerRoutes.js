const express = require('express');
const {
  listCustomers,
  getCustomer,
  updateCustomer,
  setBlocked,
  getCustomerOrders,
  adjustRewardPoints,
  getActivity,
} = require('../controllers/customerController');

const router = express.Router();

router.get('/', listCustomers);
router.get('/:id', getCustomer);
router.put('/:id', updateCustomer);
router.patch('/:id/block', setBlocked);
router.get('/:id/orders', getCustomerOrders);
router.post('/:id/reward-points', adjustRewardPoints);
router.get('/:id/activity', getActivity);

module.exports = router;
