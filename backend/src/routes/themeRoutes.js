const express = require('express');
const { getActiveTheme, listThemes } = require('../controllers/themeController');

const router = express.Router();

router.get('/', getActiveTheme);
router.get('/catalog', listThemes);

module.exports = router;
