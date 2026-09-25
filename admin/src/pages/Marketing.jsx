import { useEffect, useState } from 'react';
import {
  fetchAbandonedCarts,
  sendRecoveryEmail,
  setCartStatus,
  fetchCampaigns,
  fetchCampaignSegments,
  createCampaign,
  deleteCampaign,
  sendCampaign,
  fetchWhatsAppCampaigns,
  fetchWhatsAppCampaignSegments,
  createWhatsAppCampaign,
  deleteWhatsAppCampaign,
  sendWhatsAppCampaign,
} from '../api/marketing';

const SEGMENT_LABELS = {
  all_customers: 'All Customers',
  abandoned_cart: 'Abandoned Cart Customers',
  no_orders_30d: 'No Orders in 30 Days',
  first_time_buyers: 'First-Time Buyers',
};

export default function Marketing() {
  const [tab, setTab] = useState('cart-recovery');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Marketing</h1>

      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setTab('cart-recovery')}
          className={`px-3 py-2 text-sm border-b-2 -mb-px ${
            tab === 'cart-recovery' ? 'border-gray-900 text-gray-900 font-medium' : 'border-transparent text-gray-500'
          }`}
        >
          Abandoned Cart Recovery
        </button>
        <button
          onClick={() => setTab('email')}
          className={`px-3 py-2 text-sm border-b-2 -mb-px ${
            tab === 'email' ? 'border-gray-900 text-gray-900 font-medium' : 'border-transparent text-gray-500'
          }`}
        >
          Email Marketing
        </button>
        <button
          onClick={() => setTab('whatsapp')}
          className={`px-3 py-2 text-sm border-b-2 -mb-px ${
            tab === 'whatsapp' ? 'border-gray-900 text-gray-900 font-medium' : 'border-transparent text-gray-500'
          }`}
        >
          WhatsApp Marketing
        </button>
      </div>

      {tab === 'cart-recovery' && <AbandonedCartRecovery />}
      {tab === 'email' && <EmailMarketing />}
      {tab === 'whatsapp' && <WhatsAppMarketing />}
    </div>
  );
}

function AbandonedCartRecovery() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchAbandonedCarts()
      .then(setCarts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSendRecovery(id) {
    try {
      const updated = await sendRecoveryEmail(id);
      setCarts((prev) => prev.map((c) => (c._id === id ? { ...c, ...updated } : c)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMarkRecovered(id) {
    try {
      await setCartStatus(id, 'recovered');
      setCarts((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function cartValue(cart) {
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  return (
    <div>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Cart Value</th>
              <th className="px-4 py-3">Last Activity</th>
              <th className="px-4 py-3">Recovery Emails Sent</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={6}>Loading...</td></tr>
            )}
            {!loading && carts.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={6}>No abandoned carts.</td></tr>
            )}
            {carts.map((cart) => (
              <tr key={cart._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{cart.customer?.name || '—'}</td>
                <td className="px-4 py-3">{cart.items.map((i) => i.product?.name).filter(Boolean).join(', ')}</td>
                <td className="px-4 py-3">₹{cartValue(cart)}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(cart.lastActivityAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">{cart.recoveryEmailCount}</td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  <button onClick={() => handleSendRecovery(cart._id)} className="btn-action btn-action-blue">
                    Send Recovery Email
                  </button>
                  <button onClick={() => handleMarkRecovered(cart._id)} className="btn-action btn-action-green">
                    Mark Recovered
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        "Send Recovery Email" logs the attempt here; wiring it to a real inbox needs an email provider (SMTP/SendGrid) added later.
      </p>
    </div>
  );
}

function EmailMarketing() {
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    fetchCampaigns()
      .then(setCampaigns)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    fetchCampaignSegments().then(setSegments).catch(() => {});
  }, []);

  async function handleSend(id) {
    try {
      const updated = await sendCampaign(id);
      setCampaigns((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800">
          New Campaign
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Segment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Recipients</th>
              <th className="px-4 py-3">Delivered</th>
              <th className="px-4 py-3">Sent</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={7}>Loading...</td></tr>
            )}
            {!loading && campaigns.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={7}>No campaigns yet.</td></tr>
            )}
            {campaigns.map((c) => (
              <tr key={c._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3">{SEGMENT_LABELS[c.segment]}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${c.status === 'sent' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">{c.recipientCount || '—'}</td>
                <td className="px-4 py-3">
                  {c.status === 'sent' ? (
                    c.deliveryMode === 'live' ? (
                      <span className="text-xs text-gray-700">
                        {c.sentCount} sent{c.failedCount ? `, ${c.failedCount} failed` : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-600" title="Brevo email API key / sender not configured in Settings > Notifications, so no real emails went out.">
                        Not configured
                      </span>
                    )
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{c.sentAt ? new Date(c.sentAt).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  {c.status === 'draft' && (
                    <>
                      <button onClick={() => handleSend(c._id)} className="btn-action btn-action-blue">Send</button>
                      <button onClick={() => handleDelete(c._id)} className="btn-action btn-action-red">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        "Send" emails every customer in the segment via Brevo (Settings &gt; Notifications &gt; Email Provider). If
        the Brevo API key / sender email isn't configured there, the campaign is still marked sent but no real
        emails go out — the "Delivered" column shows "Not configured" in that case.
      </p>

      {showForm && (
        <CampaignForm
          segments={segments}
          onClose={() => setShowForm(false)}
          onSaved={(campaign) => {
            setCampaigns((prev) => [campaign, ...prev]);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function WhatsAppMarketing() {
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    fetchWhatsAppCampaigns()
      .then(setCampaigns)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => {
    fetchWhatsAppCampaignSegments().then(setSegments).catch(() => {});
  }, []);

  async function handleSend(id) {
    try {
      const updated = await sendWhatsAppCampaign(id);
      setCampaigns((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await deleteWhatsAppCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800">
          New Campaign
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Segment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Recipients</th>
              <th className="px-4 py-3">Delivered</th>
              <th className="px-4 py-3">Sent</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={7}>Loading...</td></tr>
            )}
            {!loading && campaigns.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={7}>No campaigns yet.</td></tr>
            )}
            {campaigns.map((c) => (
              <tr key={c._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3">{SEGMENT_LABELS[c.segment]}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${c.status === 'sent' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">{c.recipientCount || '—'}</td>
                <td className="px-4 py-3">
                  {c.status === 'sent' ? (
                    c.deliveryMode === 'live' ? (
                      <span className="text-xs text-gray-700">
                        {c.sentCount} sent{c.failedCount ? `, ${c.failedCount} failed` : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-600" title="Meta WhatsApp access token / phone number ID not configured in Settings > Notifications, so no real messages went out.">
                        Not configured
                      </span>
                    )
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{c.sentAt ? new Date(c.sentAt).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  {c.status === 'draft' && (
                    <>
                      <button onClick={() => handleSend(c._id)} className="btn-action btn-action-blue">Send</button>
                      <button onClick={() => handleDelete(c._id)} className="btn-action btn-action-red">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        "Send" messages every customer in the segment via Meta's WhatsApp Cloud API (Settings &gt; Notifications &gt;
        WhatsApp Provider). Freeform text only delivers within an active 24-hour customer conversation window; if
        the access token / phone number ID isn't configured, the campaign is still marked sent but no real messages
        go out — the "Delivered" column shows "Not configured" in that case.
      </p>

      {showForm && (
        <WhatsAppCampaignForm
          segments={segments}
          onClose={() => setShowForm(false)}
          onSaved={(campaign) => {
            setCampaigns((prev) => [campaign, ...prev]);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function WhatsAppCampaignForm({ segments, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [segment, setSegment] = useState(segments[0] || 'all_customers');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const campaign = await createWhatsAppCampaign({ name, message, segment });
      onSaved(campaign);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">New WhatsApp Campaign</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea className="input" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Audience Segment</label>
          <select className="input" value={segment} onChange={(e) => setSegment(e.target.value)}>
            {segments.map((s) => (
              <option key={s} value={s}>{SEGMENT_LABELS[s] || s}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function CampaignForm({ segments, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState(segments[0] || 'all_customers');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const campaign = await createCampaign({ name, subject, body, segment });
      onSaved(campaign);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">New Email Campaign</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
          <textarea className="input" rows={4} value={body} onChange={(e) => setBody(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Audience Segment</label>
          <select className="input" value={segment} onChange={(e) => setSegment(e.target.value)}>
            {segments.map((s) => (
              <option key={s} value={s}>{SEGMENT_LABELS[s] || s}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
