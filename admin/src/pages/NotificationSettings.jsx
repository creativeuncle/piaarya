import { useEffect, useState } from 'react';
import { fetchSettings, updateSettings, fetchNotificationLogs } from '../api/settings';

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <span className="relative inline-flex h-6 w-11 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-gray-300 peer-checked:bg-gray-900 transition-colors" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      {label && <span className="text-sm font-medium text-gray-900">{label}</span>}
    </label>
  );
}

const CHANNEL_LABELS = {
  email: 'Email Notifications',
  sms: 'SMS Notifications',
  whatsapp: 'WhatsApp Notifications',
};

const STATUS_STYLES = {
  sent: 'text-green-600',
  simulated: 'text-gray-500',
  failed: 'text-red-600',
};

const EMPTY_EMAIL_CONFIG = {
  brevoApiKey: '',
  brevoApiKeyMasked: '',
  hasBrevoApiKey: false,
  senderName: '',
  senderEmail: '',
  adminEmail: '',
};

const EMPTY_SMS_CONFIG = {
  fast2smsApiKey: '',
  fast2smsApiKeyMasked: '',
  hasFast2smsApiKey: false,
  adminPhone: '',
};

export default function NotificationSettings() {
  const [channels, setChannels] = useState({ email: true, sms: true, whatsapp: true });
  const [events, setEvents] = useState({});
  const [eventDefs, setEventDefs] = useState([]);
  const [emailConfig, setEmailConfig] = useState(EMPTY_EMAIL_CONFIG);
  const [smsConfig, setSmsConfig] = useState(EMPTY_SMS_CONFIG);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function load() {
    fetchSettings()
      .then((data) => {
        setChannels(data.notifications.channels);
        setEvents(data.notifications.events);
        setEventDefs(data.notificationEventDefinitions);
        setEmailConfig({
          brevoApiKey: '',
          brevoApiKeyMasked: data.notifications.email.brevoApiKeyMasked,
          hasBrevoApiKey: data.notifications.email.hasBrevoApiKey,
          senderName: data.notifications.email.senderName,
          senderEmail: data.notifications.email.senderEmail,
          adminEmail: data.notifications.email.adminEmail,
        });
        setSmsConfig({
          fast2smsApiKey: '',
          fast2smsApiKeyMasked: data.notifications.sms.fast2smsApiKeyMasked,
          hasFast2smsApiKey: data.notifications.sms.hasFast2smsApiKey,
          adminPhone: data.notifications.sms.adminPhone,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    fetchNotificationLogs().then(setLogs).catch(() => {});
  }, []);

  function setChannel(key, value) {
    setChannels((prev) => ({ ...prev, [key]: value }));
  }

  function setEventEnabled(key, enabled) {
    setEvents((prev) => ({ ...prev, [key]: { ...prev[key], enabled } }));
  }

  function setEventMessage(key, msg) {
    setEvents((prev) => ({ ...prev, [key]: { ...prev[key], message: msg } }));
  }

  function setEmailField(field, value) {
    setEmailConfig((prev) => ({ ...prev, [field]: value }));
  }

  function setSmsField(field, value) {
    setSmsConfig((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const data = await updateSettings({
        notifications: {
          channels,
          events,
          email: {
            brevoApiKey: emailConfig.brevoApiKey,
            senderName: emailConfig.senderName,
            senderEmail: emailConfig.senderEmail,
            adminEmail: emailConfig.adminEmail,
          },
          sms: {
            fast2smsApiKey: smsConfig.fast2smsApiKey,
            adminPhone: smsConfig.adminPhone,
          },
        },
      });
      setChannels(data.notifications.channels);
      setEvents(data.notifications.events);
      setEmailConfig({
        brevoApiKey: '',
        brevoApiKeyMasked: data.notifications.email.brevoApiKeyMasked,
        hasBrevoApiKey: data.notifications.email.hasBrevoApiKey,
        senderName: data.notifications.email.senderName,
        senderEmail: data.notifications.email.senderEmail,
        adminEmail: data.notifications.email.adminEmail,
      });
      setSmsConfig({
        fast2smsApiKey: '',
        fast2smsApiKeyMasked: data.notifications.sms.fast2smsApiKeyMasked,
        hasFast2smsApiKey: data.notifications.sms.hasFast2smsApiKey,
        adminPhone: data.notifications.sms.adminPhone,
      });
      setMessage('Notification settings updated.');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Notifications</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-2xl">
        Control which channels customer notifications go out on, and customize the message for each order/return
        event. Connect Brevo for real emails and Fast2SMS for real SMS below — WhatsApp has no live provider
        connected yet, so it still records as simulated activity.
      </p>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 max-w-3xl mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Email Provider — Brevo</h2>
        <p className="text-xs text-gray-500 mb-4">
          Get your API key from Brevo → Settings (gear icon) → SMTP &amp; API → API Keys → Generate a new API key.
          The sender email must be a verified sender in your Brevo account.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Brevo API Key</label>
            <input
              type="password"
              className="input w-full"
              placeholder={emailConfig.hasBrevoApiKey ? emailConfig.brevoApiKeyMasked : 'xkeysib-xxxxxxxxxxxx'}
              value={emailConfig.brevoApiKey}
              onChange={(e) => setEmailField('brevoApiKey', e.target.value)}
            />
            {emailConfig.hasBrevoApiKey && (
              <p className="text-xs text-gray-400 mt-1">Currently saved: {emailConfig.brevoApiKeyMasked}. Leave blank to keep it.</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sender Name</label>
            <input
              className="input w-full"
              placeholder="Piaarya"
              value={emailConfig.senderName}
              onChange={(e) => setEmailField('senderName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sender Email (verified in Brevo)</label>
            <input
              type="email"
              className="input w-full"
              placeholder="orders@yourdomain.com"
              value={emailConfig.senderEmail}
              onChange={(e) => setEmailField('senderEmail', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Admin Notification Email</label>
            <input
              type="email"
              className="input w-full"
              placeholder="you@yourdomain.com"
              value={emailConfig.adminEmail}
              onChange={(e) => setEmailField('adminEmail', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Gets a copy of Order Placed, Processing, Delivered, Return Requested, and Exchange Requested emails.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 max-w-3xl mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">SMS Provider — Fast2SMS</h2>
        <p className="text-xs text-gray-500 mb-4">
          Get your API key from Fast2SMS → Dev API. Used for both login-with-OTP delivery and order/return SMS
          updates. Numbers are sent as plain 10-digit Indian mobile numbers.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Fast2SMS API Key</label>
            <input
              type="password"
              className="input w-full"
              placeholder={smsConfig.hasFast2smsApiKey ? smsConfig.fast2smsApiKeyMasked : 'Enter API Key'}
              value={smsConfig.fast2smsApiKey}
              onChange={(e) => setSmsField('fast2smsApiKey', e.target.value)}
            />
            {smsConfig.hasFast2smsApiKey && (
              <p className="text-xs text-gray-400 mt-1">Currently saved: {smsConfig.fast2smsApiKeyMasked}. Leave blank to keep it.</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Admin Notification Phone</label>
            <input
              type="tel"
              className="input w-full"
              placeholder="9876543210"
              value={smsConfig.adminPhone}
              onChange={(e) => setSmsField('adminPhone', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Gets a copy of Order Placed, Processing, Delivered, Return Requested, and Exchange Requested SMS.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 max-w-3xl mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Channels</h2>
        <div className="flex flex-wrap gap-8">
          {Object.keys(CHANNEL_LABELS).map((key) => (
            <Toggle
              key={key}
              checked={channels[key]}
              onChange={(v) => setChannel(key, v)}
              label={CHANNEL_LABELS[key]}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 max-w-3xl mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Event Notifications</h2>
        <div className="space-y-6">
          {eventDefs.map((def) => {
            const event = events[def.key] || { enabled: true, message: '' };
            return (
              <div key={def.key} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900">{def.label}</p>
                  <Toggle checked={event.enabled} onChange={(v) => setEventEnabled(def.key, v)} />
                </div>
                <textarea
                  value={event.message}
                  onChange={(e) => setEventMessage(def.key, e.target.value)}
                  rows={2}
                  disabled={!event.enabled}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Available variables: {'{{customerName}}'}, {'{{orderNumber}}'}, {'{{amount}}'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md disabled:opacity-60 mb-8"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>

      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto max-w-4xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 && (
                <tr><td className="px-4 py-4 text-gray-400" colSpan={6}>No notifications triggered yet.</td></tr>
              )}
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="px-4 py-3">{log.event}</td>
                  <td className="px-4 py-3 uppercase text-xs">{log.channel}</td>
                  <td className="px-4 py-3">{log.recipient}</td>
                  <td className="px-4 py-3">{log.customer?.name || '—'}</td>
                  <td className={`px-4 py-3 text-xs font-medium capitalize ${STATUS_STYLES[log.status] || ''}`}>
                    {log.status}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
