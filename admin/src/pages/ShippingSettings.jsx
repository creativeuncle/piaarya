import { useEffect, useState } from 'react';
import { fetchShippingZones, createShippingZone, updateShippingZone, deleteShippingZone } from '../api/shipping';
import { INDIAN_STATES } from '../constants/indianStates';

function emptyZone() {
  return { name: '', states: [], isDefault: false, rates: [{ label: '', price: '', freeAboveAmount: '' }] };
}

export default function ShippingSettings() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    fetchShippingZones()
      .then(setZones)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startCreate() {
    setEditingId('new');
    setForm(emptyZone());
  }

  function startEdit(zone) {
    setEditingId(zone._id);
    setForm({
      name: zone.name,
      states: zone.states || [],
      isDefault: zone.isDefault,
      rates: zone.rates.length ? zone.rates.map((r) => ({ ...r })) : [{ label: '', price: '', freeAboveAmount: '' }],
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(null);
  }

  function toggleState(state) {
    setForm((prev) => ({
      ...prev,
      states: prev.states.includes(state) ? prev.states.filter((s) => s !== state) : [...prev.states, state],
    }));
  }

  function setRateField(index, field, value) {
    setForm((prev) => ({
      ...prev,
      rates: prev.rates.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    }));
  }

  function addRate() {
    setForm((prev) => ({ ...prev, rates: [...prev.rates, { label: '', price: '', freeAboveAmount: '' }] }));
  }

  function removeRate(index) {
    setForm((prev) => ({ ...prev, rates: prev.rates.filter((_, i) => i !== index) }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        states: form.isDefault ? [] : form.states,
        isDefault: form.isDefault,
        rates: form.rates
          .filter((r) => r.label)
          .map((r) => ({
            label: r.label,
            price: Number(r.price) || 0,
            freeAboveAmount: Number(r.freeAboveAmount) || 0,
          })),
      };

      if (editingId === 'new') {
        const created = await createShippingZone(payload);
        setZones((prev) => [...prev, created]);
      } else {
        const updated = await updateShippingZone(editingId, payload);
        setZones((prev) => prev.map((z) => (z._id === editingId ? updated : z)));
      }
      cancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this shipping zone?')) return;
    try {
      await deleteShippingZone(id);
      setZones((prev) => prev.filter((z) => z._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Shipping</h1>
        {editingId === null && (
          <button onClick={startCreate} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800">
            + Add Zone
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Define shipping zones by state, each with one or more rates (flat rate, optionally free above a subtotal).
        Add one zone with "Rest of India" marked as default to cover states not listed anywhere else.
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="space-y-4">
        {zones.map((zone) =>
          editingId === zone._id ? (
            <ZoneForm
              key={zone._id}
              form={form}
              saving={saving}
              onToggleState={toggleState}
              onSetField={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
              onRateField={setRateField}
              onAddRate={addRate}
              onRemoveRate={removeRate}
              onSave={handleSave}
              onCancel={cancelEdit}
            />
          ) : (
            <div key={zone._id} className="bg-white rounded-lg shadow border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-gray-900">{zone.name}</h2>
                  {zone.isDefault && (
                    <span className="text-[10px] uppercase tracking-wide bg-gray-900 text-white px-2 py-0.5 rounded-full">
                      Rest of India
                    </span>
                  )}
                </div>
                <div className="space-x-3">
                  <button onClick={() => startEdit(zone)} className="btn-action btn-action-blue">Edit</button>
                  <button onClick={() => handleDelete(zone._id)} className="btn-action btn-action-red">Delete</button>
                </div>
              </div>
              {!zone.isDefault && (
                <p className="text-xs text-gray-500 mb-3">{zone.states.join(', ') || 'No states selected'}</p>
              )}
              <div className="space-y-1">
                {zone.rates.map((rate, i) => (
                  <div key={i} className="flex items-center justify-between text-sm text-gray-700">
                    <span>{rate.label}</span>
                    <span>
                      ₹{rate.price}
                      {rate.freeAboveAmount > 0 && (
                        <span className="text-xs text-gray-400"> (free above ₹{rate.freeAboveAmount})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {editingId === 'new' && (
          <ZoneForm
            form={form}
            saving={saving}
            onToggleState={toggleState}
            onSetField={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
            onRateField={setRateField}
            onAddRate={addRate}
            onRemoveRate={removeRate}
            onSave={handleSave}
            onCancel={cancelEdit}
          />
        )}

        {zones.length === 0 && editingId === null && (
          <p className="text-sm text-gray-400">No shipping zones yet. Add one to start charging shipping at checkout.</p>
        )}
      </div>
    </div>
  );
}

function ZoneForm({ form, saving, onToggleState, onSetField, onRateField, onAddRate, onRemoveRate, onSave, onCancel }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 p-5 space-y-4">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Zone Name</label>
        <input
          className="input w-full"
          placeholder="e.g. South India, Rest of India"
          value={form.name}
          onChange={(e) => onSetField('name', e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={form.isDefault} onChange={(e) => onSetField('isDefault', e.target.checked)} />
        <span className="text-sm text-gray-700">This is the default zone (covers any state not listed in another zone)</span>
      </label>

      {!form.isDefault && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">States covered</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
            {INDIAN_STATES.map((state) => (
              <button
                type="button"
                key={state}
                onClick={() => onToggleState(state)}
                className={`text-xs px-2 py-1 rounded-full border ${
                  form.states.includes(state)
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-500 mb-2">Rates</label>
        <div className="space-y-2">
          {form.rates.map((rate, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_140px_auto] gap-2 items-center">
              <input
                className="input"
                placeholder="Label (e.g. Standard)"
                value={rate.label}
                onChange={(e) => onRateField(i, 'label', e.target.value)}
              />
              <input
                className="input"
                type="number"
                placeholder="Price"
                value={rate.price}
                onChange={(e) => onRateField(i, 'price', e.target.value)}
              />
              <input
                className="input"
                type="number"
                placeholder="Free above ₹"
                value={rate.freeAboveAmount}
                onChange={(e) => onRateField(i, 'freeAboveAmount', e.target.value)}
              />
              <button type="button" onClick={() => onRemoveRate(i)} className="text-red-600 text-xs">×</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={onAddRate} className="btn-secondary text-xs mt-2">+ Add Rate</button>
      </div>

      <div className="flex gap-3">
        <button onClick={onSave} disabled={saving} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Zone'}
        </button>
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </div>
  );
}
