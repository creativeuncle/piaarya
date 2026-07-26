import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/me';

export default function Profile() {
  const { customer, token } = useAuth();
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateProfile(token, { name, phone });
      setMessage('Profile updated successfully.');
    } catch {
      setMessage('Could not update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Profile</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Email</label>
          <input
            type="email"
            value={customer?.email || ''}
            disabled
            className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        {message && <p className="text-sm text-gray-600">{message}</p>}
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white font-medium px-6 py-2.5 rounded-md text-sm disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
