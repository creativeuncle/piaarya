const webPush = require('web-push');
const PlatformSettings = require('../models/PlatformSettings');
const PushSubscription = require('../models/PushSubscription');

// One shared VAPID key pair for the whole platform (see PlatformSettings.webPush)
// — generated once on first use and reused after that.
async function getVapidKeys() {
  let settings = await PlatformSettings.findOne();
  if (!settings) settings = await PlatformSettings.create({});

  if (!settings.webPush?.vapidPublicKey || !settings.webPush?.vapidPrivateKey) {
    const { publicKey, privateKey } = webPush.generateVAPIDKeys();
    settings.webPush = { vapidPublicKey: publicKey, vapidPrivateKey: privateKey };
    await settings.save();
  }

  return { publicKey: settings.webPush.vapidPublicKey, privateKey: settings.webPush.vapidPrivateKey };
}

async function sendWebPush(subscription, payload) {
  const { publicKey, privateKey } = await getVapidKeys();
  webPush.setVapidDetails('mailto:support@cartdodo.com', publicKey, privateKey);

  await webPush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    },
    JSON.stringify(payload)
  );
}

// Reserved for a future native app — Web Push doesn't reach a native iOS/
// Android app, that needs Firebase Cloud Messaging (firebase-admin SDK +
// a service account) instead. Not configured yet, so this just logs.
async function sendFcmPush(subscription, payload) {
  console.log(`[push] FCM send skipped (not configured yet) for token ${subscription.fcmToken}:`, payload.title);
}

// Sends a notification to every device a store's admin team has registered
// (Settings > ... PWA install, "allow notifications"). Failures for one
// device never block the others; a permanently-dead web-push subscription
// (410/404 from the browser's push service) is cleaned up automatically.
async function sendPushToStoreAdmins({ title, body, data }) {
  try {
    const subscriptions = await PushSubscription.find();
    const payload = { title, body, data: data || {} };

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          if (sub.type === 'web-push') await sendWebPush(sub, payload);
          else if (sub.type === 'fcm') await sendFcmPush(sub, payload);
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await PushSubscription.findByIdAndDelete(sub._id);
          } else {
            console.error(`Push send failed for subscription ${sub._id}:`, err.message);
          }
        }
      })
    );
  } catch (err) {
    // Push notifications must never break the flow (e.g. order placement)
    // that triggers them.
    console.error('sendPushToStoreAdmins failed:', err.message);
  }
}

module.exports = { getVapidKeys, sendPushToStoreAdmins };
