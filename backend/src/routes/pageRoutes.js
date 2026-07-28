const express = require('express');
const { listPages, getPage, createPage, updatePage, deletePage, getPageBySlug } = require('../controllers/pageController');

const router = express.Router();

router.get('/', listPages);
router.get('/slug/:slug', getPageBySlug);
router.get('/:id', getPage);
router.post('/', createPage);
router.put('/:id', updatePage);
router.delete('/:id', deletePage);

module.exports = router;
