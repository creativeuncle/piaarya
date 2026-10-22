const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const ContactSubmission = require('../models/ContactSubmission');

async function subscribeNewsletter(req, res, next) {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    await NewsletterSubscriber.updateOne({ email }, { email }, { upsert: true });
    res.status(201).json({ message: 'Subscribed' });
  } catch (err) {
    next(err);
  }
}

async function submitContactForm(req, res, next) {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    await ContactSubmission.create({ name, email, message });
    res.status(201).json({ message: 'Message sent' });
  } catch (err) {
    next(err);
  }
}

module.exports = { subscribeNewsletter, submitContactForm };
