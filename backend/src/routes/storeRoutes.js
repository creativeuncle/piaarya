const express = require('express');
const { getGeneral, updateGeneral } = require('../controllers/storeController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdminAuth);
router.get('/general', getGeneral);
router.put('/general', updateGeneral);

module.exports = router;
