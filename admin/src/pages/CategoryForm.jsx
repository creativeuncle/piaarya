import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCategories, createCategory, updateCategory } from '../api/categories';
import { buildTree, flattenTree, MAX_DEPTH, LEVEL_LABELS } from '../utils/categoryTree';
import ImageUpload from '../components/ImageUpload';

const EMPTY = { name: '', slug: '', parent: '', image: '', banner: '', seoTitle: '', metaDescription: '' };

function findNode(nodes, id) {
  for (const node of nodes) {
    if (node._id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

export default function CategoryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [category, setCategory] = useState(EMPTY);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then((categories) => {
        setAllCategories(categories);
        if (isEdit) {
          const existing = categories.find((c) => c._id === id);
          if (existing) {
            setCategory({
              name: existing.name,
              slug: existing.slug,
              parent: existing.parent?._id || existing.parent || '',
              image: existing.image || '',
              banner: existing.banner || '',
              seoTitle: existing.seoTitle || '',
              metaDescription: existing.metaDescription || '',
            });
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(field, value) {
    setCategory((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...category, parent: category.parent || null };
      if (isEdit) await updateCategory(id, payload);
      else await createCategory(payload);
      navigate('/categories');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;

  const { tree } = buildTree(allCategories);
  const excludedIds = new Set();
  if (isEdit) {
    excludedIds.add(id);
    const selfNode = findNode(tree, id);
    if (selfNode) flattenTree(selfNode.children).forEach((n) => excludedIds.add(n._id));
  }
  const parentOptions = flattenTree(tree).filter((c) => c.depth < MAX_DEPTH && !excludedIds.has(c._id));

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{isEdit ? 'Edit Category' : 'Add Category'}</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-100 p-5 space-y-4">
        <Field label="Category Name" required>
          <input className="input" value={category.name} onChange={(e) => set('name', e.target.value)} required />
        </Field>
        <Field label="Slug">
          <input
            className="input"
            value={category.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="auto-generated from name if left blank"
          />
        </Field>
        <Field label="Parent Category">
          <select className="input" value={category.parent} onChange={(e) => set('parent', e.target.value)}>
            <option value="">None (Main Category)</option>
            {parentOptions.map((c) => (
              <option key={c._id} value={c._id}>
                {'— '.repeat(c.depth)}{c.name} ({LEVEL_LABELS[c.depth]})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Leave blank for a Main Category. Pick a Main Category to create a Sub Category, or a Sub Category to
            create a Child Category.
          </p>
        </Field>
        <Field label="Category Image">
          <ImageUpload value={category.image} onChange={(url) => set('image', url)} />
        </Field>
        <Field label="Category Banner">
          <ImageUpload value={category.banner} onChange={(url) => set('banner', url)} />
        </Field>
        <Field label="SEO Title">
          <input className="input" value={category.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} />
        </Field>
        <Field label="Meta Description">
          <textarea className="input" rows={2} value={category.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} />
        </Field>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 disabled:opacity-50">
            {saving ? 'Saving...' : isEdit ? 'Update Category' : 'Save Category'}
          </button>
          <button type="button" onClick={() => navigate('/categories')} className="btn-secondary">Cancel</button>
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
