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

export default function NotificationSettings() {
  const [channels, setChannels] = useState({ email: true, sms: true, whatsapp: true });
  const [events, setEvents] = useState({});
  const [eventDefs, setEventDefs] = useState([]);
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

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const data = await updateSettings({ notifications: { channels, events } });
      setChannels(data.notifications.channels);
      setEvents(data.notifications.events);
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
        event. No live email, SMS, or WhatsApp provider is connected yet — sends are recorded as simulated activity
        below so this can be wired up to a real provider (SendGrid, Twilio, WhatsApp Business API, etc.) later.
      </p>

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
                <th className="px-4 py-3">Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 && (
                <tr><td className="px-4 py-4 text-gray-400" colSpan={5}>No notifications triggered yet.</td></tr>
              )}
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="px-4 py-3">{log.event}</td>
                  <td className="px-4 py-3 uppercase text-xs">{log.channel}</td>
                  <td className="px-4 py-3">{log.recipient}</td>
                  <td className="px-4 py-3">{log.customer?.name || '—'}</td>
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
