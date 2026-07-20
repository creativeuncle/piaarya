import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCoupon, createCoupon, updateCoupon } from '../api/coupons';
import { fetchCategories } from '../api/categories';
import { fetchProducts } from '../api/products';

const EMPTY = {
  code: '',
  description: '',
  discountType: 'fixed',
  discountValue: '',
  buyQuantity: '',
  getQuantity: '',
  appliesTo: 'all',
  categories: [],
  products: [],
  firstOrderOnly: false,
  autoApply: false,
  usageLimit: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

function toDateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

export default function CouponForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    fetchProducts().then((data) => setProducts(data.products)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    fetchCoupon(id)
      .then((data) =>
        setCoupon({
          ...EMPTY,
          ...data,
          categories: (data.categories || []).map((c) => c._id),
          products: (data.products || []).map((p) => p._id),
          startDate: toDateInput(data.startDate),
          endDate: toDateInput(data.endDate),
        })
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(field, value) {
    setCoupon((prev) => ({ ...prev, [field]: value }));
  }

  function toggleMultiSelect(field, id) {
    setCoupon((prev) => ({
      ...prev,
      [field]: prev[field].includes(id) ? prev[field].filter((x) => x !== id) : [...prev[field], id],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...coupon,
        discountValue: coupon.discountValue === '' ? undefined : Number(coupon.discountValue),
        buyQuantity: coupon.buyQuantity === '' ? undefined : Number(coupon.buyQuantity),
        getQuantity: coupon.getQuantity === '' ? undefined : Number(coupon.getQuantity),
        usageLimit: coupon.usageLimit === '' ? undefined : Number(coupon.usageLimit),
        startDate: coupon.startDate || undefined,
        endDate: coupon.endDate || undefined,
      };
      if (isEdit) await updateCoupon(id, payload);
      else await createCoupon(payload);
      navigate('/coupons');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{isEdit ? 'Edit Coupon' : 'Add Coupon'}</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-100 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Coupon Code" required>
            <input className="input uppercase" value={coupon.code} onChange={(e) => set('code', e.target.value)} required />
          </Field>
          <Field label="Discount Type" required>
            <select className="input" value={coupon.discountType} onChange={(e) => set('discountType', e.target.value)}>
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage</option>
              <option value="buy_x_get_y">Buy X Get Y</option>
            </select>
          </Field>
        </div>

        <Field label="Description">
          <input className="input" value={coupon.description} onChange={(e) => set('description', e.target.value)} />
        </Field>

        {coupon.discountType !== 'buy_x_get_y' ? (
          <Field label={coupon.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'} required>
            <input type="number" className="input" value={coupon.discountValue} onChange={(e) => set('discountValue', e.target.value)} required />
          </Field>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Buy Quantity" required>
              <input type="number" className="input" value={coupon.buyQuantity} onChange={(e) => set('buyQuantity', e.target.value)} required />
            </Field>
            <Field label="Get Quantity (free)" required>
              <input type="number" className="input" value={coupon.getQuantity} onChange={(e) => set('getQuantity', e.target.value)} required />
            </Field>
          </div>
        )}

        <Field label="Applies To">
          <select className="input" value={coupon.appliesTo} onChange={(e) => set('appliesTo', e.target.value)}>
            <option value="all">All Products</option>
            <option value="category">Specific Categories</option>
            <option value="product">Specific Products</option>
          </select>
        </Field>

        {coupon.appliesTo === 'category' && (
          <Field label="Categories">
            <div className="flex flex-wrap gap-2 border border-gray-200 rounded-md p-2 max-h-40 overflow-y-auto">
              {categories.map((c) => (
                <label key={c._id} className="flex items-center gap-1 text-sm bg-gray-50 px-2 py-1 rounded">
                  <input
                    type="checkbox"
                    checked={coupon.categories.includes(c._id)}
                    onChange={() => toggleMultiSelect('categories', c._id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </Field>
        )}

        {coupon.appliesTo === 'product' && (
          <Field label="Products">
            <div className="flex flex-wrap gap-2 border border-gray-200 rounded-md p-2 max-h-40 overflow-y-auto">
              {products.map((p) => (
                <label key={p._id} className="flex items-center gap-1 text-sm bg-gray-50 px-2 py-1 rounded">
                  <input
                    type="checkbox"
                    checked={coupon.products.includes(p._id)}
                    onChange={() => toggleMultiSelect('products', p._id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </Field>
        )}

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={coupon.firstOrderOnly} onChange={(e) => set('firstOrderOnly', e.target.checked)} />
            First Order Only
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={coupon.autoApply} onChange={(e) => set('autoApply', e.target.checked)} />
            Auto Apply
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={coupon.isActive} onChange={(e) => set('isActive', e.target.checked)} />
            Active
          </label>
        </div>

        <Field label="Usage Limit (leave blank for unlimited)">
          <input type="number" className="input" value={coupon.usageLimit} onChange={(e) => set('usageLimit', e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date">
            <input type="date" className="input" value={coupon.startDate} onChange={(e) => set('startDate', e.target.value)} />
          </Field>
          <Field label="End Date">
            <input type="date" className="input" value={coupon.endDate} onChange={(e) => set('endDate', e.target.value)} />
          </Field>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 disabled:opacity-50">
            {saving ? 'Saving...' : isEdit ? 'Update Coupon' : 'Save Coupon'}
          </button>
          <button type="button" onClick={() => navigate('/coupons')} className="btn-secondary">Cancel</button>
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
