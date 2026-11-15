const express = require('express');
const { login, me } = require('../controllers/platformAuthController');
const { listStores, getStore, createStore, getDashboard } = require('../controllers/platformController');
const { getPaymentSettings, updatePaymentSettings } = require('../controllers/platformSettingsController');
const { requirePlatformAuth } = require('../middleware/platformAuth');

const router = express.Router();

router.post('/login', login);
router.get('/me', requirePlatformAuth, me);

router.use(requirePlatformAuth);
router.get('/stores', listStores);
router.post('/stores', createStore);
router.get('/stores/:id', getStore);
router.get('/dashboard', getDashboard);
router.get('/payment-settings', getPaymentSettings);
router.put('/payment-settings', updatePaymentSettings);

module.exports = router;
