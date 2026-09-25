const express = require('express');
const { getNavigation, replaceNavigation } = require('../controllers/navigationController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.get('/', getNavigation);
router.put('/', requireAdminAuth, replaceNavigation);

module.exports = router;
