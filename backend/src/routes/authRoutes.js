const express = require('express');
const { signup, login, me, forgotPassword, requestOtp, verifyOtp } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.post('/forgot-password', forgotPassword);
router.post('/otp/request', requestOtp);
router.post('/otp/verify', verifyOtp);

module.exports = router;
