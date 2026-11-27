const PushSubscription = require('../models/PushSubscription');
const { getVapidKeys } = require('../services/pushNotificationService');

async function getVapidPublicKey(req, res, next) {
  try {
    const { publicKey } = await getVapidKeys();
    res.json({ publicKey });
  } catch (err) {
    next(err);
  }
}

// Registers a device (the current admin's browser/PWA, or in future a
// native app's FCM token) to receive push notifications for this store.
async function subscribe(req, res, next) {
  try {
    const { type, subscription, fcmToken, label } = req.body;
    if (!['web-push', 'fcm'].includes(type)) {
      return res.status(400).json({ message: 'type must be web-push or fcm' });
    }

    let doc;
    if (type === 'web-push') {
      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return res.status(400).json({ message: 'A valid Web Push subscription is required' });
      }
      doc = await PushSubscription.findOneAndUpdate(
        { endpoint: subscription.endpoint },
        {
          teamMember: req.teamMemberId,
          type: 'web-push',
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
          label: label || '',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      if (!fcmToken) return res.status(400).json({ message: 'fcmToken is required' });
      doc = await PushSubscription.findOneAndUpdate(
        { fcmToken },
        { teamMember: req.teamMemberId, type: 'fcm', fcmToken, label: label || '' },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

async function unsubscribe(req, res, next) {
  try {
    const { endpoint, fcmToken } = req.body;
    if (!endpoint && !fcmToken) {
      return res.status(400).json({ message: 'endpoint or fcmToken is required' });
    }
    await PushSubscription.findOneAndDelete(endpoint ? { endpoint } : { fcmToken });
    res.json({ message: 'Unsubscribed' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getVapidPublicKey, subscribe, unsubscribe };
