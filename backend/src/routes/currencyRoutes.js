const express = require('express');
const { listPublicCurrencies } = require('../controllers/currencyController');

const router = express.Router();

router.get('/', listPublicCurrencies);

module.exports = router;
