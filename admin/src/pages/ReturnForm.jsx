import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrders, fetchOrder } from '../api/orders';
import { fetchReturnReasons, createReturn } from '../api/returns';

export default function ReturnForm() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [type, setType] = useState('return');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrders('all').then((data) => setOrders(data.orders)).catch(() => {});
    fetchReturnReasons().then((data) => {
      setReasons(data);
      setReason(data[0] || '');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      return;
    }
    fetchOrder(orderId).then((data) => {
      setOrder(data);
      setSelectedItems({});
    }).catch((err) => setError(err.message));
  }, [orderId]);

  function toggleItem(index, item, checked) {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (checked) next[index] = { quantity: item.quantity };
      else delete next[index];
      return next;
    });
  }

  function setItemQuantity(index, quantity) {
    setSelectedItems((prev) => ({ ...prev, [index]: { ...prev[index], quantity } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const items = Object.entries(selectedItems).map(([index, sel]) => {
      const orderItem = order.items[index];
      return {
        product: orderItem.product?._id || orderItem.product,
        variantSku: orderItem.variantSku,
        quantity: Number(sel.quantity),
      };
    });
    if (!items.length) {
      setError('Select at least one item to return or exchange.');
      return;
    }
    setSaving(true);
    try {
      await createReturn({ order: orderId, items, type, reason, notes });
      navigate('/returns');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">New Return / Exchange</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-100 p-5 space-y-4">
        <Field label="Order" required>
          <select className="input" value={orderId} onChange={(e) => setOrderId(e.target.value)} required>
            <option value="">Select an order</option>
            {orders.map((o) => (
              <option key={o._id} value={o._id}>{o.orderNumber} — {o.customer?.name}</option>
            ))}
          </select>
        </Field>

        {order && (
          <Field label="Items">
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 border border-gray-100 rounded p-2">
                  <input
                    type="checkbox"
                    checked={i in selectedItems}
                    onChange={(e) => toggleItem(i, item, e.target.checked)}
                  />
                  <span className="flex-1 text-sm">{item.product?.name || 'Product'} (qty {item.quantity})</span>
                  {i in selectedItems && (
                    <input
                      type="number"
                      min={1}
                      max={item.quantity}
                      className="input w-20"
                      value={selectedItems[i].quantity}
                      onChange={(e) => setItemQuantity(i, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </Field>
        )}

        <Field label="Type" required>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="return">Return</option>
            <option value="exchange">Exchange</option>
          </select>
        </Field>

        <Field label="Reason" required>
          <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
            {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>

        <Field label="Notes">
          <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 disabled:opacity-50">
            {saving ? 'Saving...' : 'Submit Request'}
          </button>
          <button type="button" onClick={() => navigate('/returns')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
