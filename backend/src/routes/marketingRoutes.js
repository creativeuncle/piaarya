const express = require('express');
const {
  listAbandonedCarts,
  sendRecoveryEmail,
  updateCartStatus,
  listCampaigns,
  createCampaign,
  deleteCampaign,
  sendCampaign,
  listWhatsAppCampaigns,
  createWhatsAppCampaign,
  deleteWhatsAppCampaign,
  sendWhatsAppCampaign,
} = require('../controllers/marketingController');
const EmailCampaign = require('../models/EmailCampaign');
const WhatsAppCampaign = require('../models/WhatsAppCampaign');

const router = express.Router();

router.get('/abandoned-carts', listAbandonedCarts);
router.post('/abandoned-carts/:id/send-recovery', sendRecoveryEmail);
router.patch('/abandoned-carts/:id/status', updateCartStatus);

router.get('/campaigns/segments', (req, res) => res.json(EmailCampaign.SEGMENTS));
router.get('/campaigns', listCampaigns);
router.post('/campaigns', createCampaign);
router.delete('/campaigns/:id', deleteCampaign);
router.post('/campaigns/:id/send', sendCampaign);

router.get('/whatsapp-campaigns/segments', (req, res) => res.json(WhatsAppCampaign.SEGMENTS));
router.get('/whatsapp-campaigns', listWhatsAppCampaigns);
router.post('/whatsapp-campaigns', createWhatsAppCampaign);
router.delete('/whatsapp-campaigns/:id', deleteWhatsAppCampaign);
router.post('/whatsapp-campaigns/:id/send', sendWhatsAppCampaign);

module.exports = router;
