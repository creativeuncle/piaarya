const express = require('express');
const { listApps, installApp, toggleApp, uninstallApp } = require('../controllers/appController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/', listApps);
router.post('/:key/install', installApp);
router.put('/:key/toggle', toggleApp);
router.delete('/:key', uninstallApp);

module.exports = router;
