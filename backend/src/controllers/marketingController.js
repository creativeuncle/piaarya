const Cart = require('../models/Cart');
const EmailCampaign = require('../models/EmailCampaign');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Settings = require('../models/Settings');
const { sendBrevoEmail } = require('../services/notificationService');

async function listAbandonedCarts(req, res, next) {
  try {
    const carts = await Cart.find({ status: 'abandoned' })
      .populate('customer', 'name email')
      .populate('items.product', 'name price')
      .sort({ lastActivityAt: -1 });
    res.json(carts);
  } catch (err) {
    next(err);
  }
}

async function sendRecoveryEmail(req, res, next) {
  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.recoveryEmailCount += 1;
    cart.recoveryEmailSentAt = new Date();
    await cart.save();
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

async function updateCartStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['abandoned', 'recovered', 'converted'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const cart = await Cart.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

async function getSegmentCustomers(segment) {
  if (segment === 'abandoned_cart') {
    const customerIds = await Cart.distinct('customer', { status: 'abandoned' });
    return Customer.find({ _id: { $in: customerIds }, isBlocked: false }).select('name email');
  }
  if (segment === 'no_orders_30d') {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentCustomerIds = await Order.distinct('customer', { createdAt: { $gte: since } });
    return Customer.find({ isBlocked: false, _id: { $nin: recentCustomerIds } }).select('name email');
  }
  if (segment === 'first_time_buyers') {
    const counts = await Order.aggregate([{ $group: { _id: '$customer', count: { $sum: 1 } } }]);
    const firstTimeIds = counts.filter((c) => c.count === 1).map((c) => c._id);
    return Customer.find({ _id: { $in: firstTimeIds }, isBlocked: false }).select('name email');
  }
  return Customer.find({ isBlocked: false }).select('name email');
}

async function listCampaigns(req, res, next) {
  try {
    const campaigns = await EmailCampaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
}

async function createCampaign(req, res, next) {
  try {
    const { name, subject, body, segment } = req.body;
    const campaign = await EmailCampaign.create({ name, subject, body, segment });
    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
}

async function deleteCampaign(req, res, next) {
  try {
    const campaign = await EmailCampaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    next(err);
  }
}

async function sendCampaign(req, res, next) {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (campaign.status === 'sent') return res.status(400).json({ message: 'Campaign already sent' });

    const customers = await getSegmentCustomers(campaign.segment);
    const settings = await Settings.findOne();
    const emailConfig = settings?.notifications?.email || {};
    const canSendRealEmail = Boolean(emailConfig.brevoApiKey && emailConfig.senderEmail);

    let sentCount = 0;
    let failedCount = 0;

    if (canSendRealEmail) {
      for (const customer of customers) {
        if (!customer.email) continue;
        try {
          await sendBrevoEmail({
            apiKey: emailConfig.brevoApiKey,
            senderName: emailConfig.senderName,
            senderEmail: emailConfig.senderEmail,
            to: customer.email,
            toName: customer.name,
            subject: campaign.subject,
            text: campaign.body,
          });
          sentCount += 1;
        } catch (err) {
          failedCount += 1;
          console.error(`Campaign email send failed for ${customer.email}:`, err.message);
        }
      }
    }

    campaign.status = 'sent';
    campaign.recipientCount = customers.length;
    campaign.sentCount = sentCount;
    campaign.failedCount = failedCount;
    campaign.deliveryMode = canSendRealEmail ? 'live' : 'simulated';
    campaign.sentAt = new Date();
    await campaign.save();

    res.json(campaign);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAbandonedCarts,
  sendRecoveryEmail,
  updateCartStatus,
  listCampaigns,
  createCampaign,
  deleteCampaign,
  sendCampaign,
};
