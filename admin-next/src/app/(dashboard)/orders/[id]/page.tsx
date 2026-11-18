'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchOrder, updateOrderStatus, updateOrderTracking } from '../../../../lib/api/orders';
import { ORDER_STATUSES } from '../../../../constants/orderStatuses';
import { SkeletonPage } from '../../../../components/Skeleton';

export default function OrderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [editingTracking, setEditingTracking] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    fetchOrder(id)
      .then(setOrder)
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleStatusChange(status) {
    setSavingStatus(true);
    try {
      const updated = await updateOrderStatus(id, status);
      setOrder(updated);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleSaveTracking(payload) {
    try {
      const updated = await updateOrderTracking(id, payload);
      setOrder(updated);
      setEditingTracking(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  if (loading) return <SkeletonPage />;
  if (error && !order) return <p className="p-6 text-red-600 text-sm">{error}</p>;
  if (!order) return null;

  const address = order.shippingAddress || {};
  const addressLines = [
    address.line1,
    address.line2,
    [address.city, address.state, address.pincode].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean);

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <button onClick={() => router.push('/orders')} className="text-sm text-gray-500 hover:underline mb-1">
            ← Back to Orders
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">
            Placed {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
          </p>
        </div>
        <Link
          href={`/orders/${order._id}/invoice`}
          target="_blank"
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Print Invoice
        </Link>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <SummaryCard label="Status">
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={savingStatus}
            className="border border-gray-200 rounded px-2 py-1.5 text-sm w-full"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </SummaryCard>
        <SummaryCard label="Payment">
          <p className="text-sm text-gray-900 capitalize">{order.paymentStatus}</p>
          <p className="text-xs text-gray-500 uppercase">{order.paymentMethod}</p>
        </SummaryCard>
        <SummaryCard label="Total">
          <p className="text-lg font-semibold text-gray-900">₹{order.totalAmount}</p>
        </SummaryCard>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Customer</h2>
          <p className="text-sm text-gray-900">{order.customer?.name || '—'}</p>
          <p className="text-sm text-gray-500">{order.customer?.email || '—'}</p>
          {order.customer?.phone && <p className="text-sm text-gray-500">{order.customer.phone}</p>}
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Shipping Address</h2>
          {addressLines.length ? (
            addressLines.map((line, i) => (
              <p key={i} className="text-sm text-gray-700">{line}</p>
            ))
          ) : (
            <p className="text-sm text-gray-400">No address on file.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Shipping & Tracking</h2>
          <button onClick={() => setEditingTracking(true)} className="btn-action btn-action-blue">
            {order.shipping?.trackingNumber ? 'Edit Tracking' : 'Add Tracking'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {order.shipping?.zoneName && (
            <Row label="Zone" value={order.shipping.zoneName} />
          )}
          {order.shipping?.rateLabel && (
            <Row label="Rate" value={`${order.shipping.rateLabel}${order.shipping.cost ? ` — ₹${order.shipping.cost}` : ''}`} />
          )}
          <Row label="Carrier" value={order.shipping?.carrier || '—'} />
          <Row label="Tracking Number" value={order.shipping?.trackingNumber || '—'} />
          {order.shipping?.trackingUrl && (
            <Row
              label="Tracking URL"
              value={
                <a href={order.shipping.trackingUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                  {order.shipping.trackingUrl}
                </a>
              }
            />
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden mb-6">
        <h2 className="text-base font-semibold text-gray-900 p-5 pb-0">Items</h2>
        <table className="min-w-full text-sm mt-3">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-5 py-2"></th>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2 text-right">Price</th>
              <th className="px-5 py-2 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item, i) => (
              <tr key={i}>
                <td className="px-5 py-3">
                  {item.product?.media?.[0] ? (
                    <img src={item.product.media[0].url} alt="" className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded" />
                  )}
                </td>
                <td className="px-3 py-3 font-medium text-gray-900">{item.product?.name || '—'}</td>
                <td className="px-3 py-3">{item.variantSku || item.product?.sku || '—'}</td>
                <td className="px-3 py-3">{item.quantity}</td>
                <td className="px-3 py-3 text-right">₹{item.price}</td>
                <td className="px-5 py-3 text-right font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end p-5">
          <div className="w-64 space-y-1 text-sm">
            {order.taxBreakup?.taxType && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Taxable Amount</span>
                  <span>₹{order.taxBreakup.taxableAmount}</span>
                </div>
                {order.taxBreakup.taxType === 'intra_state' ? (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>CGST</span>
                      <span>₹{order.taxBreakup.cgst}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>SGST</span>
                      <span>₹{order.taxBreakup.sgst}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-gray-600">
                    <span>IGST</span>
                    <span>₹{order.taxBreakup.igst}</span>
                  </div>
                )}
              </>
            )}
            {order.shipping?.cost > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>₹{order.shipping.cost}</span>
              </div>
            )}
            {order.giftCard?.amountUsed > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Gift Card ({order.giftCard.code})</span>
                <span>-₹{order.giftCard.amountUsed}</span>
              </div>
            )}
            {order.storeCreditUsed > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Store Credit</span>
                <span>-₹{order.storeCreditUsed}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {editingTracking && (
        <TrackingModal order={order} onClose={() => setEditingTracking(false)} onSave={handleSaveTracking} />
      )}
    </div>
  );
}

function SummaryCard({ label, children }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 p-4">
      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <>
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900">{value}</span>
    </>
  );
}

function TrackingModal({ order, onClose, onSave }) {
  const [carrier, setCarrier] = useState(order.shipping?.carrier || '');
  const [trackingNumber, setTrackingNumber] = useState(order.shipping?.trackingNumber || '');
  const [trackingUrl, setTrackingUrl] = useState(order.shipping?.trackingUrl || '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({ carrier, trackingNumber, trackingUrl });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Tracking — {order.orderNumber}</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
          <input className="input" placeholder="e.g. Delhivery, Shiprocket" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
          <input className="input" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tracking URL</label>
          <input className="input" value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} />
        </div>
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
