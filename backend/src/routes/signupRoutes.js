const express = require('express');
const { checkSlug, signup } = require('../controllers/signupController');

const router = express.Router();

router.get('/check-slug', checkSlug);
router.post('/', signup);

module.exports = router;
