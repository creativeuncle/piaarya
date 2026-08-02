import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchCustomer,
  updateCustomer,
  setCustomerBlocked,
  fetchCustomerOrders,
  fetchCustomerActivity,
  adjustRewardPoints,
  adjustStoreCredit,
} from '../api/customers';

const EMPTY_ADDRESS = { label: '', line1: '', line2: '', city: '', state: '', pincode: '', country: '', isDefault: false };
const TABS = ['Profile', 'Orders', 'Activity'];

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [tab, setTab] = useState('Profile');
  const [orders, setOrders] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);

  useEffect(() => {
    fetchCustomer(id)
      .then(setCustomer)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (tab === 'Orders' && orders === null) {
      fetchCustomerOrders(id).then(setOrders).catch((err) => setError(err.message));
    }
    if (tab === 'Activity' && activity === null) {
      fetchCustomerActivity(id).then(setActivity).catch((err) => setError(err.message));
    }
  }, [tab, id, orders, activity]);

  function set(field, value) {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  }

  function setAddress(index, field, value) {
    setCustomer((prev) => ({
      ...prev,
      addresses: prev.addresses.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    }));
  }

  function addAddress() {
    setCustomer((prev) => ({ ...prev, addresses: [...prev.addresses, { ...EMPTY_ADDRESS }] }));
  }

  function removeAddress(index) {
    setCustomer((prev) => ({ ...prev, addresses: prev.addresses.filter((_, i) => i !== index) }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateCustomer(id, {
        name: customer.name,
        phone: customer.phone,
        addresses: customer.addresses,
      });
      setCustomer(updated);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleBlock() {
    try {
      const updated = await setCustomerBlocked(id, !customer.isBlocked);
      setCustomer(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;
  if (!customer) return <p className="p-6 text-red-600 text-sm">Customer not found.</p>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">{customer.name}</h1>
        <button onClick={() => navigate('/customers')} className="btn-secondary">Back</button>
      </div>
      <p className="text-gray-500 text-sm mb-4">{customer.email}</p>

      <div className="flex items-center gap-3 mb-6">
        {customer.isBlocked ? (
          <span className="text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded">Blocked</span>
        ) : (
          <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded">Active</span>
        )}
        <button onClick={toggleBlock} className="btn-secondary text-xs">
          {customer.isBlocked ? 'Unblock Customer' : 'Block Customer'}
        </button>
        <span className="text-sm text-gray-500 ml-auto">Reward Points: <strong>{customer.rewardPoints}</strong></span>
        <button onClick={() => setShowRewardModal(true)} className="btn-secondary text-xs">Adjust Points</button>
        <span className="text-sm text-gray-500">Store Credit: <strong>₹{customer.storeCredit || 0}</strong></span>
        <button onClick={() => setShowCreditModal(true)} className="btn-secondary text-xs">Adjust Credit</button>
      </div>

      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px ${
              tab === t ? 'border-gray-900 text-gray-900 font-medium' : 'border-transparent text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {tab === 'Profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-lg shadow border border-gray-100 p-5 space-y-4">
          <Field label="Name">
            <input className="input" value={customer.name} onChange={(e) => set('name', e.target.value)} required />
          </Field>
          <Field label="Phone">
            <input className="input" value={customer.phone || ''} onChange={(e) => set('phone', e.target.value)} />
          </Field>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Addresses</label>
            {customer.addresses.map((address, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 mb-3 border border-gray-100 rounded p-3">
                <input className="input" placeholder="Label (Home/Work)" value={address.label} onChange={(e) => setAddress(i, 'label', e.target.value)} />
                <input className="input" placeholder="Line 1" value={address.line1} onChange={(e) => setAddress(i, 'line1', e.target.value)} />
                <input className="input" placeholder="Line 2" value={address.line2} onChange={(e) => setAddress(i, 'line2', e.target.value)} />
                <input className="input" placeholder="City" value={address.city} onChange={(e) => setAddress(i, 'city', e.target.value)} />
                <input className="input" placeholder="State" value={address.state} onChange={(e) => setAddress(i, 'state', e.target.value)} />
                <input className="input" placeholder="Pincode" value={address.pincode} onChange={(e) => setAddress(i, 'pincode', e.target.value)} />
                <input className="input" placeholder="Country" value={address.country} onChange={(e) => setAddress(i, 'country', e.target.value)} />
                <button type="button" onClick={() => removeAddress(i)} className="text-red-600 text-sm text-left">Remove address</button>
              </div>
            ))}
            <button type="button" onClick={addAddress} className="btn-secondary">+ Add Address</button>
          </div>

          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'Orders' && (
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders === null && (
                <tr><td className="px-4 py-4 text-gray-400" colSpan={4}>Loading...</td></tr>
              )}
              {orders?.length === 0 && (
                <tr><td className="px-4 py-4 text-gray-400" colSpan={4}>No orders yet.</td></tr>
              )}
              {orders?.map((order) => (
                <tr key={order._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-4 py-3">₹{order.totalAmount}</td>
                  <td className="px-4 py-3 capitalize">{order.status}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Activity' && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
          {activity === null && <p className="text-gray-400 text-sm">Loading...</p>}
          {activity?.length === 0 && <p className="text-gray-400 text-sm">No activity yet.</p>}
          <ul className="space-y-3">
            {activity?.map((event, i) => (
              <li key={i} className="text-sm border-l-2 border-gray-200 pl-3">
                <p className="text-gray-900">{event.description}</p>
                <p className="text-gray-400 text-xs">{new Date(event.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showRewardModal && (
        <RewardPointsModal
          customer={customer}
          onClose={() => setShowRewardModal(false)}
          onSaved={(updated) => {
            setCustomer(updated);
            setShowRewardModal(false);
            setActivity(null);
          }}
        />
      )}

      {showCreditModal && (
        <StoreCreditModal
          customer={customer}
          onClose={() => setShowCreditModal(false)}
          onSaved={(updated) => {
            setCustomer(updated);
            setShowCreditModal(false);
            setActivity(null);
          }}
        />
      )}
    </div>
  );
}

function RewardPointsModal({ customer, onClose, onSaved }) {
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await adjustRewardPoints(customer._id, { delta: Number(delta), reason });
      onSaved(updated);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Adjust Reward Points</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Field label="Points change (use negative to subtract)">
          <input type="number" className="input" value={delta} onChange={(e) => setDelta(e.target.value)} required />
        </Field>
        <Field label="Reason">
          <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Order reward, goodwill credit" />
        </Field>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function StoreCreditModal({ customer, onClose, onSaved }) {
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await adjustStoreCredit(customer._id, { delta: Number(delta), reason });
      onSaved(updated);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Adjust Store Credit</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Field label="Amount change in ₹ (use negative to subtract)">
          <input type="number" className="input" value={delta} onChange={(e) => setDelta(e.target.value)} required />
        </Field>
        <Field label="Reason">
          <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Refund, goodwill credit" />
        </Field>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
