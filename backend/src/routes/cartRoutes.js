const express = require('express');
const { syncCart } = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.put('/sync', requireAuth, syncCart);

module.exports = router;
