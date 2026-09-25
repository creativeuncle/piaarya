import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchMyOrder, cancelMyOrder } from '../../api/me';
import { fetchReturnReasons, createReturnRequest } from '../../api/returns';

const CANCEL_WINDOW_MS = 10 * 60 * 1000;

export default function OrderDetail() {
  const { id } = useParams();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [requestModal, setRequestModal] = useState(null); // 'return' | 'exchange' | null
  const [requestStep, setRequestStep] = useState(1);
  const [reasons, setReasons] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [refundMethod, setRefundMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  function load() {
    setLoading(true);
    fetchMyOrder(token, id)
      .then(setOrder)
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token, id]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchReturnReasons().then(setReasons).catch(() => {});
  }, []);

  const canCancel = useMemo(() => {
    if (!order) return false;
    if (order.status === 'cancelled') return false;
    return now - new Date(order.createdAt).getTime() <= CANCEL_WINDOW_MS;
  }, [order, now]);

  async function handleConfirmCancel() {
    setCancelling(true);
    try {
      const updated = await cancelMyOrder(token, id);
      setOrder((prev) => ({ ...prev, status: updated.status }));
      setShowCancelConfirm(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setShowCancelConfirm(false);
    } finally {
      setCancelling(false);
    }
  }

  const canRefundToOriginalMethod = order?.paymentMethod === 'stripe' && Boolean(order?.paymentReference?.paymentIntentId);

  function openRequestModal(type) {
    setRequestModal(type);
    setRequestStep(1);
    setSelectedItems({});
    setReason('');
    setNotes('');
    setRefundMethod(canRefundToOriginalMethod ? 'original_payment_method' : 'upi');
    setUpiId('');
    setAccountHolderName('');
    setAccountNumber('');
    setIfsc('');
    setRequestMessage('');
  }

  function toggleItem(idx, item) {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[idx]) delete next[idx];
      else next[idx] = { product: item.product?._id, variantSku: item.variantSku || '', quantity: item.quantity };
      return next;
    });
  }

  function handleContinueToPaymentStep(e) {
    e.preventDefault();
    const items = Object.values(selectedItems);
    if (items.length === 0) {
      setRequestMessage('Please select at least one item.');
      return;
    }
    if (!reason) {
      setRequestMessage('Please select a reason.');
      return;
    }
    setRequestMessage('');

    if (requestModal === 'exchange') {
      submitRequest(items);
    } else {
      setRequestStep(2);
    }
  }

  async function submitRequest(items, refundDetails) {
    setSubmitting(true);
    try {
      await createReturnRequest({
        order: id,
        items,
        type: requestModal,
        reason,
        notes,
        refundMethod: requestModal === 'return' ? refundMethod : undefined,
        refundDetails: requestModal === 'return' ? refundDetails : undefined,
      });
      setRequestMessage('Your request has been submitted. You can track it under Requests.');
      setRequestStep(3);
    } catch (err) {
      setRequestMessage(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmitPaymentStep(e) {
    e.preventDefault();
    const items = Object.values(selectedItems);

    if (refundMethod === 'upi' && !upiId) {
      setRequestMessage('Please enter your UPI ID.');
      return;
    }
    if (refundMethod === 'bank' && (!accountHolderName || !accountNumber || !ifsc)) {
      setRequestMessage('Please fill in all bank account details.');
      return;
    }
    setRequestMessage('');

    let refundDetails;
    if (refundMethod === 'upi') refundDetails = { upiId };
    else if (refundMethod === 'bank') refundDetails = { accountHolderName, accountNumber, ifsc };
    else refundDetails = {};

    submitRequest(items, refundDetails);
  }

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (error && !order) return <p className="text-sm text-red-600">{error}</p>;
  if (!order) return null;

  const address = order.shippingAddress || {};

  return (
    <div>
      <Link to="/dashboard/orders" className="text-sm text-gray-500 underline">
        ← Back to Your Orders
      </Link>

      <div className="flex items-center justify-between mt-4 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
        <span className="text-xs uppercase tracking-wide bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
          {order.status}
        </span>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <p className="text-xs text-gray-500 mb-6">Placed on {new Date(order.createdAt).toLocaleString()}</p>

      <div className="space-y-4 mb-6">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 border border-gray-200 rounded-lg p-4">
            <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
              {item.product?.media?.[0]?.url && (
                <img src={item.product.media[0].url} alt={item.product?.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.product?.name || 'Product'}</p>
              {item.variantSku && <p className="text-xs text-gray-500">{item.variantSku}</p>}
              <p className="text-xs text-gray-500">Qty {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">₹{item.price * item.quantity}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Shipping Address</h2>
          <p className="text-sm text-gray-600">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ''}
          </p>
          <p className="text-sm text-gray-600">
            {address.city}, {address.state} {address.pincode}
          </p>
          <p className="text-sm text-gray-600">{address.country}</p>
        </div>
        <div className="sm:text-right">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Order Total</h2>
          <p className="text-lg font-bold text-gray-900">₹{order.totalAmount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-6">
        <button
          onClick={() => openRequestModal('return')}
          className="border border-gray-300 text-gray-900 text-sm font-medium px-5 py-2.5 rounded-md hover:bg-gray-50"
        >
          Return
        </button>
        <button
          onClick={() => openRequestModal('exchange')}
          className="border border-gray-300 text-gray-900 text-sm font-medium px-5 py-2.5 rounded-md hover:bg-gray-50"
        >
          Exchange
        </button>
        <button
          onClick={() => setShowCancelConfirm(true)}
          disabled={!canCancel}
          className="border border-red-300 text-red-600 text-sm font-medium px-5 py-2.5 rounded-md hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          Cancel Order
        </button>
      </div>
      {!canCancel && order.status !== 'cancelled' && (
        <p className="text-xs text-gray-400 mt-2">The 10-minute cancellation window for this order has passed.</p>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Confirm Cancel?</h3>
            <p className="text-sm text-gray-600 mb-6">This will cancel order #{order.orderNumber}. This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="text-sm text-gray-600 px-4 py-2"
              >
                No, keep it
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-60"
              >
                {cancelling ? 'Cancelling...' : 'Yes, cancel order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {requestModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {requestModal === 'return' ? 'Request Return' : 'Request Exchange'}
            </h3>
            {requestModal === 'return' && requestStep < 3 && (
              <p className="text-xs text-gray-400 mb-4">Step {requestStep} of 2</p>
            )}

            {requestStep === 1 && (
              <form onSubmit={handleContinueToPaymentStep} className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Select item(s)</p>
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedItems[idx])}
                          onChange={() => toggleItem(idx, item)}
                        />
                        {item.product?.name || 'Product'} × {item.quantity}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Select a reason</option>
                    {reasons.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>

                {requestMessage && <p className="text-sm text-gray-600">{requestMessage}</p>}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestModal(null)}
                    className="text-sm text-gray-600 px-4 py-2"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : requestModal === 'return' ? 'Next' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}

            {requestStep === 2 && requestModal === 'return' && (
              <form onSubmit={handleSubmitPaymentStep} className="space-y-4">
                <p className="text-sm font-medium text-gray-700">Payment Transfer</p>
                <p className="text-xs text-gray-500 -mt-2">
                  Tell us where to send your refund once the return is approved.
                </p>

                <div className="flex flex-wrap gap-3">
                  {canRefundToOriginalMethod && (
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="refundMethod"
                        checked={refundMethod === 'original_payment_method'}
                        onChange={() => setRefundMethod('original_payment_method')}
                      />
                      Original Payment Method
                    </label>
                  )}
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="refundMethod"
                      checked={refundMethod === 'upi'}
                      onChange={() => setRefundMethod('upi')}
                    />
                    UPI
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="refundMethod"
                      checked={refundMethod === 'bank'}
                      onChange={() => setRefundMethod('bank')}
                    />
                    Bank Account
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="refundMethod"
                      checked={refundMethod === 'store_credit'}
                      onChange={() => setRefundMethod('store_credit')}
                    />
                    Store Credit
                  </label>
                </div>

                {refundMethod === 'store_credit' && (
                  <p className="text-xs text-gray-500">
                    Your refund will be added as store credit to your account, usable on your next order.
                  </p>
                )}

                {refundMethod === 'original_payment_method' && (
                  <p className="text-xs text-gray-500">
                    Your refund will be sent back to the card you paid with via Stripe.
                  </p>
                )}

                {refundMethod === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                    <input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                )}

                {refundMethod === 'bank' && (
                  <div className="space-y-3">
                    <input
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Account Holder Name"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Account Number"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <input
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      placeholder="IFSC Code"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                )}

                {requestMessage && <p className="text-sm text-gray-600">{requestMessage}</p>}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestStep(1)}
                    className="text-sm text-gray-600 px-4 py-2"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}

            {requestStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">{requestMessage}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setRequestModal(null)}
                    className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
