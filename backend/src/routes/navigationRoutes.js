const express = require('express');
const { getNavigation, replaceNavigation } = require('../controllers/navigationController');

const router = express.Router();

router.get('/', getNavigation);
router.put('/', replaceNavigation);

module.exports = router;
