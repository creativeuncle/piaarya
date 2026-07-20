import { useEffect, useState } from 'react';
import { fetchInventory, adjustInventory, fetchInventoryHistory, fetchWarehouses, createWarehouse } from '../api/inventory';
import { updateProduct } from '../api/products';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [newWarehouseName, setNewWarehouseName] = useState('');

  function load() {
    setLoading(true);
    setError(null);
    fetchInventory({ lowStockOnly: lowStockOnly || undefined, search: search || undefined })
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchWarehouses().then(setWarehouses).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lowStockOnly, search]);

  async function handleWarehouseChange(productId, warehouseId) {
    try {
      await updateProduct(productId, { warehouse: warehouseId || null });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleThresholdChange(productId, value) {
    try {
      await updateProduct(productId, { lowStockThreshold: Number(value) || 0 });
      setProducts((prev) => prev.map((p) => (p._id === productId ? { ...p, lowStockThreshold: Number(value) || 0 } : p)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddWarehouse() {
    if (!newWarehouseName.trim()) return;
    try {
      const warehouse = await createWarehouse({ name: newWarehouseName.trim() });
      setWarehouses((prev) => [...prev, warehouse]);
      setNewWarehouseName('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Inventory</h1>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={() => setLowStockOnly(false)}
          className={`px-3 py-1.5 rounded-md text-sm border ${!lowStockOnly ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
        >
          All
        </button>
        <button
          onClick={() => setLowStockOnly(true)}
          className={`px-3 py-1.5 rounded-md text-sm border ${lowStockOnly ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
        >
          Low Stock
        </button>
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-64"
        />
        <div className="flex gap-2 ml-auto">
          <input
            type="text"
            placeholder="New warehouse name"
            value={newWarehouseName}
            onChange={(e) => setNewWarehouseName(e.target.value)}
            className="input w-48"
          />
          <button onClick={handleAddWarehouse} className="btn-secondary">+ Add Warehouse</button>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Warehouse</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Low Stock Alert</th>
              <th className="px-4 py-3">Damaged</th>
              <th className="px-4 py-3">Reserved</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={8}>Loading...</td></tr>
            )}
            {!loading && products.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={8}>No products found.</td></tr>
            )}
            {products.map((product) => {
              const isLow = product.stock <= product.lowStockThreshold;
              return (
                <tr key={product._id} className={isLow ? 'bg-red-50' : ''}>
                  <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-3">{product.sku}</td>
                  <td className="px-4 py-3">
                    <select
                      className="input"
                      value={product.warehouse?._id || ''}
                      onChange={(e) => handleWarehouseChange(product._id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {warehouses.map((w) => (
                        <option key={w._id} value={w._id}>{w.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className={`px-4 py-3 font-semibold ${isLow ? 'text-red-600' : ''}`}>{product.stock}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      className="input w-20"
                      defaultValue={product.lowStockThreshold}
                      onBlur={(e) => handleThresholdChange(product._id, e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">{product.damagedStock}</td>
                  <td className="px-4 py-3">{product.reservedStock}</td>
                  <td className="px-4 py-3 space-x-3">
                    <button onClick={() => setAdjustTarget(product)} className="btn-action btn-action-blue">Adjust Stock</button>
                    <button onClick={() => setHistoryTarget(product)} className="btn-action btn-action-gray">History</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {adjustTarget && (
        <AdjustStockModal
          product={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onSaved={() => {
            setAdjustTarget(null);
            load();
          }}
        />
      )}

      {historyTarget && (
        <HistoryModal product={historyTarget} onClose={() => setHistoryTarget(null)} />
      )}
    </div>
  );
}

function AdjustStockModal({ product, onClose, onSaved }) {
  const [type, setType] = useState('stock');
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adjustInventory(product._id, { type, delta: Number(delta), reason });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900">Adjust Stock — {product.name}</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="stock">Stock (available)</option>
            <option value="damaged">Damaged Stock</option>
            <option value="reserved">Reserved Stock</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity change (use negative to subtract)
          </label>
          <input type="number" className="input" value={delta} onChange={(e) => setDelta(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Restock, damaged in transit" />
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

function HistoryModal({ product, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventoryHistory(product._id)
      .then(setLogs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [product._id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory History — {product.name}</h2>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {loading && <p className="text-gray-400 text-sm">Loading...</p>}
        {!loading && logs.length === 0 && <p className="text-gray-400 text-sm">No history yet.</p>}
        {!loading && logs.length > 0 && (
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Type</th>
                <th className="py-2">Change</th>
                <th className="py-2">New value</th>
                <th className="py-2">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="py-2">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="py-2 capitalize">{log.type}</td>
                  <td className={`py-2 ${log.quantityChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                  </td>
                  <td className="py-2">{log.newValue}</td>
                  <td className="py-2 text-gray-500">{log.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button onClick={onClose} className="btn-secondary mt-4">Close</button>
      </div>
    </div>
  );
}
