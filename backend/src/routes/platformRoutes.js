const express = require('express');
const { login, me } = require('../controllers/platformAuthController');
const { listStores, getStore, createStore, getDashboard } = require('../controllers/platformController');
const { requirePlatformAuth } = require('../middleware/platformAuth');

const router = express.Router();

router.post('/login', login);
router.get('/me', requirePlatformAuth, me);

router.use(requirePlatformAuth);
router.get('/stores', listStores);
router.post('/stores', createStore);
router.get('/stores/:id', getStore);
router.get('/dashboard', getDashboard);

module.exports = router;
