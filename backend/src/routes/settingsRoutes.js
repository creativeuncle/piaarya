const express = require('express');
const { getSettings, updateSettings, listNotificationLogs } = require('../controllers/settingsController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/', getSettings);
router.put('/', updateSettings);
router.get('/notifications/logs', listNotificationLogs);

module.exports = router;
