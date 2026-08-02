const crypto = require('crypto');
const GiftCard = require('../models/GiftCard');

function generateCode() {
  return `GC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function listGiftCards(req, res, next) {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.code = { $regex: search, $options: 'i' };
    const giftCards = await GiftCard.find(filter).populate('issuedTo', 'name email').sort({ createdAt: -1 });
    res.json(giftCards);
  } catch (err) {
    next(err);
  }
}

async function createGiftCard(req, res, next) {
  try {
    const { code, initialBalance, expiresAt, note, issuedTo } = req.body;
    const amount = Number(initialBalance);
    if (!amount || amount <= 0) return res.status(400).json({ message: 'initialBalance must be a positive number' });

    const finalCode = code ? code.toUpperCase().trim() : generateCode();
    const giftCard = await GiftCard.create({
      code: finalCode,
      initialBalance: amount,
      balance: amount,
      expiresAt: expiresAt || undefined,
      note,
      issuedTo: issuedTo || undefined,
    });
    res.status(201).json(giftCard);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'A gift card with this code already exists' });
    next(err);
  }
}

async function toggleGiftCard(req, res, next) {
  try {
    const giftCard = await GiftCard.findById(req.params.id);
    if (!giftCard) return res.status(404).json({ message: 'Gift card not found' });
    giftCard.isActive = Boolean(req.body.isActive);
    await giftCard.save();
    res.json(giftCard);
  } catch (err) {
    next(err);
  }
}

async function deleteGiftCard(req, res, next) {
  try {
    const giftCard = await GiftCard.findByIdAndDelete(req.params.id);
    if (!giftCard) return res.status(404).json({ message: 'Gift card not found' });
    res.json({ message: 'Gift card deleted' });
  } catch (err) {
    next(err);
  }
}

async function validateGiftCard(req, res, next) {
  try {
    const { code } = req.body;
    const giftCard = await GiftCard.findOne({ code: String(code || '').toUpperCase().trim() });

    if (!giftCard) return res.json({ valid: false, message: 'Gift card code not found' });
    if (!giftCard.isActive) return res.json({ valid: false, message: 'This gift card is no longer active' });
    if (giftCard.expiresAt && new Date() > giftCard.expiresAt) return res.json({ valid: false, message: 'This gift card has expired' });
    if (giftCard.balance <= 0) return res.json({ valid: false, message: 'This gift card has no balance left' });

    res.json({ valid: true, code: giftCard.code, balance: giftCard.balance });
  } catch (err) {
    next(err);
  }
}

module.exports = { listGiftCards, createGiftCard, toggleGiftCard, deleteGiftCard, validateGiftCard };
