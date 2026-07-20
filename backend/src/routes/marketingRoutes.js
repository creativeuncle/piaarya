const express = require('express');
const {
  listAbandonedCarts,
  sendRecoveryEmail,
  updateCartStatus,
  listCampaigns,
  createCampaign,
  deleteCampaign,
  sendCampaign,
} = require('../controllers/marketingController');
const EmailCampaign = require('../models/EmailCampaign');

const router = express.Router();

router.get('/abandoned-carts', listAbandonedCarts);
router.post('/abandoned-carts/:id/send-recovery', sendRecoveryEmail);
router.patch('/abandoned-carts/:id/status', updateCartStatus);

router.get('/campaigns/segments', (req, res) => res.json(EmailCampaign.SEGMENTS));
router.get('/campaigns', listCampaigns);
router.post('/campaigns', createCampaign);
router.delete('/campaigns/:id', deleteCampaign);
router.post('/campaigns/:id/send', sendCampaign);

module.exports = router;
