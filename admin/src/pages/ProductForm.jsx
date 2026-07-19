import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProduct, createProduct, updateProduct } from '../api/products';
import { fetchCategories, createCategory } from '../api/categories';
import ImageUpload from '../components/ImageUpload';
import MultiUpload from '../components/MultiUpload';

const EMPTY_VARIANT = { color: '', size: '', weight: '', material: '', price: '', sku: '', stock: '', image: '' };

const EMPTY_PRODUCT = {
  name: '',
  slug: '',
  sku: '',
  category: '',
  subCategory: '',
  tags: '',
  description: '',
  specifications: [],
  featuredImage: '',
  images: [],
  videos: [],
  altText: '',
  variants: [],
  seoTitle: '',
  metaDescription: '',
  price: '',
  stock: '',
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [product, setProduct] = useState(EMPTY_PRODUCT);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    fetchProduct(id)
      .then((data) =>
        setProduct({
          ...EMPTY_PRODUCT,
          ...data,
          category: data.category?._id || '',
          subCategory: data.subCategory?._id || '',
          tags: (data.tags || []).join(', '),
          specifications: Object.entries(data.specifications || {}).map(([key, value]) => ({ key, value })),
        })
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(field, value) {
    setProduct((prev) => ({ ...prev, [field]: value }));
  }

  function setVariant(index, field, value) {
    setProduct((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));
  }

  function addVariant() {
    setProduct((prev) => ({ ...prev, variants: [...prev.variants, { ...EMPTY_VARIANT }] }));
  }

  function removeVariant(index) {
    setProduct((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
  }

  function setSpec(index, field, value) {
    setProduct((prev) => ({
      ...prev,
      specifications: prev.specifications.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  }

  function addSpec() {
    setProduct((prev) => ({ ...prev, specifications: [...prev.specifications, { key: '', value: '' }] }));
  }

  function removeSpec(index) {
    setProduct((prev) => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== index) }));
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    try {
      const category = await createCategory({ name: newCategoryName.trim() });
      setCategories((prev) => [...prev, category]);
      set('category', category._id);
      setNewCategoryName('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...product,
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        tags: product.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        specifications: Object.fromEntries(
          product.specifications.filter((s) => s.key).map((s) => [s.key, s.value])
        ),
        variants: product.variants.map((v) => ({
          ...v,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
        })),
      };
      if (isEdit) await updateProduct(id, payload);
      else await createProduct(payload);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;

  const subCategories = categories.filter((c) => c.parent?._id === product.category || c.parent === product.category);

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Basic details">
          <Field label="Product Name" required>
            <input className="input" value={product.name} onChange={(e) => set('name', e.target.value)} required />
          </Field>
          <Field label="Slug">
            <input
              className="input"
              value={product.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="auto-generated from name if left blank"
            />
          </Field>
          <Field label="SKU" required>
            <input className="input" value={product.sku} onChange={(e) => set('sku', e.target.value)} required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select className="input" value={product.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <div className="flex gap-2 mt-2">
                <input
                  className="input flex-1"
                  placeholder="Quick-add new category"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button type="button" onClick={handleAddCategory} className="btn-secondary">Add</button>
              </div>
            </Field>
            <Field label="Sub Category">
              <select className="input" value={product.subCategory} onChange={(e) => set('subCategory', e.target.value)}>
                <option value="">Select sub category</option>
                {subCategories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Tags (comma separated)">
            <input className="input" value={product.tags} onChange={(e) => set('tags', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price" required>
              <input
                type="number"
                className="input"
                value={product.price}
                onChange={(e) => set('price', e.target.value)}
                required
              />
            </Field>
            <Field label="Stock Quantity">
              <input type="number" className="input" value={product.stock} onChange={(e) => set('stock', e.target.value)} />
            </Field>
          </div>
          <Field label="Description">
            <textarea className="input" rows={4} value={product.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
        </Section>

        <Section title="Specifications">
          {product.specifications.map((spec, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                className="input"
                placeholder="Key (e.g. Fabric)"
                value={spec.key}
                onChange={(e) => setSpec(i, 'key', e.target.value)}
              />
              <input
                className="input"
                placeholder="Value (e.g. Cotton)"
                value={spec.value}
                onChange={(e) => setSpec(i, 'value', e.target.value)}
              />
              <button type="button" onClick={() => removeSpec(i)} className="text-red-600 text-sm px-2">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addSpec} className="btn-secondary">+ Add Specification</button>
        </Section>

        <Section title="Media">
          <ImageUpload label="Featured Image" value={product.featuredImage} onChange={(url) => set('featuredImage', url)} />
          <MultiUpload label="Multiple Images" values={product.images} onChange={(v) => set('images', v)} />
          <MultiUpload label="Product Videos" values={product.videos} onChange={(v) => set('videos', v)} accept="video/*" />
          <Field label="Alt Text">
            <input className="input" value={product.altText} onChange={(e) => set('altText', e.target.value)} />
          </Field>
        </Section>

        <Section title="Product Variants">
          {product.variants.map((variant, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mb-3 items-end border-b border-gray-100 pb-3">
              <Field label="Color"><input className="input" value={variant.color} onChange={(e) => setVariant(i, 'color', e.target.value)} /></Field>
              <Field label="Size"><input className="input" value={variant.size} onChange={(e) => setVariant(i, 'size', e.target.value)} /></Field>
              <Field label="Weight"><input className="input" value={variant.weight} onChange={(e) => setVariant(i, 'weight', e.target.value)} /></Field>
              <Field label="Material"><input className="input" value={variant.material} onChange={(e) => setVariant(i, 'material', e.target.value)} /></Field>
              <Field label="Variant Price"><input type="number" className="input" value={variant.price} onChange={(e) => setVariant(i, 'price', e.target.value)} /></Field>
              <Field label="Variant SKU"><input className="input" value={variant.sku} onChange={(e) => setVariant(i, 'sku', e.target.value)} /></Field>
              <Field label="Variant Stock"><input type="number" className="input" value={variant.stock} onChange={(e) => setVariant(i, 'stock', e.target.value)} /></Field>
              <div>
                <ImageUpload label="Variant Image" value={variant.image} onChange={(url) => setVariant(i, 'image', url)} />
                <button type="button" onClick={() => removeVariant(i)} className="text-red-600 text-sm mt-1">Remove variant</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addVariant} className="btn-secondary">+ Add Variant</button>
        </Section>

        <Section title="SEO">
          <Field label="SEO Title">
            <input className="input" value={product.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} />
          </Field>
          <Field label="Meta Description">
            <textarea className="input" rows={2} value={product.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} />
          </Field>
        </Section>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 disabled:opacity-50">
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Save Product'}
          </button>
          <button type="button" onClick={() => navigate('/products')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
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
