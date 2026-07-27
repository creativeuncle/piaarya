const express = require('express');
const { getSettings, updateSettings, listNotificationLogs } = require('../controllers/settingsController');

const router = express.Router();

router.get('/', getSettings);
router.put('/', updateSettings);
router.get('/notifications/logs', listNotificationLogs);

module.exports = router;
