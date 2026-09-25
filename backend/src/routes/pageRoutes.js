const express = require('express');
const { listPages, getPage, createPage, updatePage, deletePage, getPageBySlug } = require('../controllers/pageController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.get('/', requireAdminAuth, listPages);
router.get('/slug/:slug', getPageBySlug);
router.get('/:id', requireAdminAuth, getPage);
router.post('/', requireAdminAuth, createPage);
router.put('/:id', requireAdminAuth, updatePage);
router.delete('/:id', requireAdminAuth, deletePage);

module.exports = router;
