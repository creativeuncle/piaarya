import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchInvoice } from '../api/orders';
import { fetchSettings } from '../api/settings';

export default function Invoice() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [tax, setTax] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchInvoice(id), fetchSettings().catch(() => null)])
      .then(([orderData, settingsData]) => {
        setOrder(orderData);
        setTax(settingsData?.tax || null);
        setTimeout(() => window.print(), 300);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p className="p-6 text-red-600 text-sm">{error}</p>;
  if (!order) return <p className="p-6 text-gray-400 text-sm">Loading invoice...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto text-gray-900">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-xl font-bold">{tax?.legalBusinessName || 'Piaarya'}</h1>
          <p className="text-sm text-gray-500">Invoice</p>
          {tax?.gstEnabled && tax?.gstin && <p className="text-xs text-gray-500 mt-1">GSTIN: {tax.gstin}</p>}
        </div>
        <div className="text-right text-sm">
          <p className="font-medium">{order.orderNumber}</p>
          <p className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-6 text-sm">
        <p className="font-medium text-gray-700">Bill to</p>
        <p>{order.customer?.name}</p>
        <p className="text-gray-500">{order.customer?.email}</p>
      </div>

      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b border-gray-300 text-left">
            <th className="py-2">Item</th>
            <th className="py-2">SKU</th>
            {order.taxBreakup?.taxType && <th className="py-2">HSN</th>}
            <th className="py-2">Qty</th>
            <th className="py-2 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2">{item.product?.name || '—'}</td>
              <td className="py-2">{item.variantSku || item.product?.sku || '—'}</td>
              {order.taxBreakup?.taxType && <td className="py-2">{item.hsnCode || '—'}</td>}
              <td className="py-2">{item.quantity}</td>
              <td className="py-2 text-right">₹{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end text-sm">
        <div className="w-56 space-y-1">
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
              <span>Shipping{order.shipping.rateLabel ? ` (${order.shipping.rateLabel})` : ''}</span>
              <span>₹{order.shipping.cost}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t border-gray-300 pt-2">
            <span>Total</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-400">Status: {order.status} · Payment: {order.paymentStatus}</p>
    </div>
  );
}
