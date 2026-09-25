'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStore } from '../../../../lib/api/stores';

const PLANS = ['free', 'starter', 'pro'];

export default function NewStorePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    slug: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    plan: 'free',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const store = await createStore(form);
      router.replace(`/stores/${store.id}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create store');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Onboard a New Store</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-lg shadow p-6 space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-700 mb-1">Store Name</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Slug</label>
          <input
            className="input"
            value={form.slug}
            onChange={(e) => update('slug', e.target.value.toLowerCase())}
            placeholder="e.g. sharma-fashion"
            pattern="[a-z0-9-]+"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Plan</label>
          <select className="input" value={form.plan} onChange={(e) => update('plan', e.target.value)}>
            {PLANS.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        </div>

        <hr className="border-gray-100" />
        <p className="text-sm text-gray-500">
          The owner below becomes the store's first team member (store-level super_admin) — they log into
          admin-next with these credentials.
        </p>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Owner Name</label>
          <input
            className="input"
            value={form.ownerName}
            onChange={(e) => update('ownerName', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Owner Email</label>
          <input
            type="email"
            className="input"
            value={form.ownerEmail}
            onChange={(e) => update('ownerEmail', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Owner Password</label>
          <input
            type="password"
            className="input"
            value={form.ownerPassword}
            onChange={(e) => update('ownerPassword', e.target.value)}
            minLength={6}
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-secondary bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
        >
          {submitting ? 'Creating…' : 'Create Store'}
        </button>
      </form>
    </div>
  );
}
