import { useEffect, useState } from 'react';
import { fetchGiftCards, createGiftCard, toggleGiftCard, deleteGiftCard } from '../api/giftCards';

export default function GiftCards() {
  const [giftCards, setGiftCards] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    fetchGiftCards(search ? { search } : {})
      .then(setGiftCards)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleToggle(id, isActive) {
    try {
      const updated = await toggleGiftCard(id, isActive);
      setGiftCards((prev) => prev.map((g) => (g._id === id ? updated : g)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this gift card?')) return;
    try {
      await deleteGiftCard(id);
      setGiftCards((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Gift Cards</h1>
        <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800">
          Issue Gift Card
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <input
        type="text"
        placeholder="Search by code..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input w-64 mb-4"
      />

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Issued To</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={6}>Loading...</td></tr>
            )}
            {!loading && giftCards.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={6}>No gift cards yet.</td></tr>
            )}
            {giftCards.map((gc) => (
              <tr key={gc._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{gc.code}</td>
                <td className="px-4 py-3">₹{gc.balance} / ₹{gc.initialBalance}</td>
                <td className="px-4 py-3">{gc.issuedTo?.name || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{gc.expiresAt ? new Date(gc.expiresAt).toLocaleDateString() : 'No expiry'}</td>
                <td className="px-4 py-3">
                  {gc.isActive ? (
                    <span className="text-green-600 text-xs font-medium">Active</span>
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 space-x-3 whitespace-nowrap">
                  <button onClick={() => handleToggle(gc._id, !gc.isActive)} className="btn-action btn-action-blue">
                    {gc.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(gc._id)} className="btn-action btn-action-red">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <GiftCardForm
          onClose={() => setShowForm(false)}
          onSaved={(gc) => {
            setGiftCards((prev) => [gc, ...prev]);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function GiftCardForm({ onClose, onSaved }) {
  const [code, setCode] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const giftCard = await createGiftCard({
        code: code || undefined,
        initialBalance: Number(initialBalance),
        expiresAt: expiresAt || undefined,
        note,
      });
      onSaved(giftCard);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Issue Gift Card</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code (optional)</label>
          <input className="input" placeholder="Leave blank to auto-generate" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Balance (₹)</label>
          <input type="number" className="input" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expires On (optional)</label>
          <input type="date" className="input" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Customer loyalty gift" />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
            {saving ? 'Issuing...' : 'Issue'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
