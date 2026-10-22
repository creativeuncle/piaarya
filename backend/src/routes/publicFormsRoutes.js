const express = require('express');
const { subscribeNewsletter, submitContactForm } = require('../controllers/publicFormsController');

const router = express.Router();

router.post('/newsletter/subscribe', subscribeNewsletter);
router.post('/contact', submitContactForm);

module.exports = router;
