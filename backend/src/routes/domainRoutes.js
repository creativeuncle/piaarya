const express = require('express');
const { listDomains, addDomain, verifyDomain, makePrimary, removeDomain } = require('../controllers/domainController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.use(requireAdminAuth);

router.get('/', listDomains);
router.post('/', addDomain);
router.post('/:id/verify', verifyDomain);
router.post('/:id/make-primary', makePrimary);
router.delete('/:id', removeDomain);

module.exports = router;
