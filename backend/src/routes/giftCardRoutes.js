const express = require('express');
const { listGiftCards, createGiftCard, toggleGiftCard, deleteGiftCard, validateGiftCard } = require('../controllers/giftCardController');
const { requireAdminAuth } = require('../middleware/adminAuth');

const router = express.Router();

router.get('/', requireAdminAuth, listGiftCards);
router.post('/', requireAdminAuth, createGiftCard);
router.post('/validate', validateGiftCard);
router.put('/:id/toggle', requireAdminAuth, toggleGiftCard);
router.delete('/:id', requireAdminAuth, deleteGiftCard);

module.exports = router;
