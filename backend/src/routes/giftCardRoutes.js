const express = require('express');
const { listGiftCards, createGiftCard, toggleGiftCard, deleteGiftCard, validateGiftCard } = require('../controllers/giftCardController');

const router = express.Router();

router.get('/', listGiftCards);
router.post('/', createGiftCard);
router.post('/validate', validateGiftCard);
router.put('/:id/toggle', toggleGiftCard);
router.delete('/:id', deleteGiftCard);

module.exports = router;
