import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { fetchPage, createPage, updatePage } from '../api/pages';

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['blockquote', 'code-block'],
    ['clean'],
  ],
};

const EMPTY = {
  title: '',
  slug: '',
  content: '',
  seoTitle: '',
  metaDescription: '',
  isPublished: true,
};

export default function PageForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    fetchPage(id)
      .then((page) => {
        setForm({
          title: page.title,
          slug: page.slug,
          content: page.content || '',
          seoTitle: page.seoTitle || '',
          metaDescription: page.metaDescription || '',
          isPublished: page.isPublished,
        });
        setSlugTouched(true);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTitleChange(value) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  }

  function handleSlugChange(value) {
    setSlugTouched(true);
    setField('slug', value);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await updatePage(id, form);
      } else {
        await createPage(form);
      }
      navigate('/settings/pages');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">{isEdit ? 'Edit Page' : 'Add New Page'}</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 space-y-5 mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Title</label>
          <input
            className="input w-full"
            placeholder="e.g. About Us"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Slug</label>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-400">/</span>
            <input
              className="input w-full"
              placeholder="about-us"
              value={form.slug}
              onChange={(e) => handleSlugChange(slugify(e.target.value))}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Auto-generated from the title. Edit if you want a custom URL.</p>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Content</label>
          <ReactQuill
            theme="snow"
            value={form.content}
            onChange={(value) => setField('content', value)}
            modules={QUILL_MODULES}
            className="bg-white [&_.ql-container]:rounded-b-md [&_.ql-toolbar]:rounded-t-md"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setField('isPublished', e.target.checked)}
          />
          <span className="text-sm text-gray-700">Published</span>
        </label>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 space-y-5 mb-6">
        <h2 className="text-base font-semibold text-gray-900">SEO</h2>
        <div>
          <label className="block text-xs text-gray-500 mb-1">SEO Title</label>
          <input
            className="input w-full"
            placeholder="Shown in search engine results"
            value={form.seoTitle}
            onChange={(e) => setField('seoTitle', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Meta Description</label>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="A short summary shown under the title in search results"
            value={form.metaDescription}
            onChange={(e) => setField('metaDescription', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Page'}
        </button>
        <button
          onClick={() => navigate('/settings/pages')}
          className="border border-gray-300 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
