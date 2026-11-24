'use client';

import { useEffect, useState } from 'react';
import { fetchGeneralSettings, updateGeneralSettings } from '../../../../lib/api/store';
import { INDIAN_STATES } from '../../../../constants/indianStates';
import { SkeletonPage } from '../../../../components/Skeleton';

const EMPTY = {
  owner: {
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    businessType: '',
    address: { line: '', city: '', state: '', pincode: '' },
  },
  business: {
    legalName: '',
    phone: '',
    address: { line: '', apartment: '', city: '', state: '', pincode: '' },
  },
};

export default function GeneralSettings() {
  const [form, setForm] = useState(EMPTY);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function load() {
    fetchGeneralSettings()
      .then((data) => {
        setForm({
          owner: data.owner,
          business: data.business,
        });
        setBusinessTypes(data.businessTypes || []);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function setOwnerField(field, value) {
    setForm((prev) => ({ ...prev, owner: { ...prev.owner, [field]: value } }));
  }

  function setOwnerAddressField(field, value) {
    setForm((prev) => ({ ...prev, owner: { ...prev.owner, address: { ...prev.owner.address, [field]: value } } }));
  }

  function setBusinessField(field, value) {
    setForm((prev) => ({ ...prev, business: { ...prev.business, [field]: value } }));
  }

  function setBusinessAddressField(field, value) {
    setForm((prev) => ({
      ...prev,
      business: { ...prev.business, address: { ...prev.business.address, [field]: value } },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const data = await updateGeneralSettings(form);
      setForm({ owner: data.owner, business: data.business });
      setMessage('Saved.');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <SkeletonPage />;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">General</h1>
      <p className="text-sm text-gray-500 mb-6">
        Your business details — used for store verification and on documents like invoices.
      </p>

      {message && <p className="text-sm text-green-600 mb-4">{message}</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <section className="bg-white rounded-lg shadow border border-gray-100 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">About your business</h2>

        <Field label="What type of business do you have?">
          <select
            className="input"
            value={form.owner.businessType}
            onChange={(e) => setOwnerField('businessType', e.target.value)}
          >
            <option value="">Select business type</option>
            {businessTypes.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Full Name">
          <input className="input" value={form.owner.name} onChange={(e) => setOwnerField('name', e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date of Birth">
            <input
              type="date"
              className="input"
              value={form.owner.dateOfBirth}
              onChange={(e) => setOwnerField('dateOfBirth', e.target.value)}
            />
          </Field>
          <Field label="Nationality">
            <input
              className="input"
              placeholder="e.g. Indian"
              value={form.owner.nationality}
              onChange={(e) => setOwnerField('nationality', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Email">
          <input
            type="email"
            className="input"
            value={form.owner.email}
            onChange={(e) => setOwnerField('email', e.target.value)}
          />
        </Field>

        <Field label="Phone Number">
          <input
            type="tel"
            className="input"
            placeholder="9876543210"
            value={form.owner.phone}
            onChange={(e) => setOwnerField('phone', e.target.value)}
          />
        </Field>

        <Field label="Residential Address">
          <input
            className="input"
            placeholder="Address line"
            value={form.owner.address.line}
            onChange={(e) => setOwnerAddressField('line', e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="City">
            <input className="input" value={form.owner.address.city} onChange={(e) => setOwnerAddressField('city', e.target.value)} />
          </Field>
          <Field label="State">
            <select className="input" value={form.owner.address.state} onChange={(e) => setOwnerAddressField('state', e.target.value)}>
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="PIN Code">
            <input className="input" value={form.owner.address.pincode} onChange={(e) => setOwnerAddressField('pincode', e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow border border-gray-100 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Business verification details</h2>

        <Field label="Registered legal business name">
          <input
            className="input"
            value={form.business.legalName}
            onChange={(e) => setBusinessField('legalName', e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">
            The official registered name of your business, not a trading name (usually your own name for a sole
            proprietorship).
          </p>
        </Field>

        <Field label="Business Address">
          <input
            className="input"
            placeholder="Address line"
            value={form.business.address.line}
            onChange={(e) => setBusinessAddressField('line', e.target.value)}
          />
        </Field>

        <Field label="Apartment, suite, etc">
          <input
            className="input"
            value={form.business.address.apartment}
            onChange={(e) => setBusinessAddressField('apartment', e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="City">
            <input className="input" value={form.business.address.city} onChange={(e) => setBusinessAddressField('city', e.target.value)} />
          </Field>
          <Field label="State">
            <select className="input" value={form.business.address.state} onChange={(e) => setBusinessAddressField('state', e.target.value)}>
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="PIN Code">
            <input className="input" value={form.business.address.pincode} onChange={(e) => setBusinessAddressField('pincode', e.target.value)} />
          </Field>
        </div>

        <Field label="Phone Number">
          <input
            type="tel"
            className="input"
            placeholder="9876543210"
            value={form.business.phone}
            onChange={(e) => setBusinessField('phone', e.target.value)}
          />
        </Field>
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
