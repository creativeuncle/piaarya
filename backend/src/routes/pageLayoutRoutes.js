const express = require('express');
const { getLayout, saveLayout } = require('../controllers/pageLayoutController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// Public — the storefront needs this with no login, same as /api/theme.
router.get('/:page', getLayout);
router.put('/:page', requireAdminAuth, saveLayout);

module.exports = router;
