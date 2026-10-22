'use client';

import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { DragDropVerticalIcon, ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import { fetchPageLayout, savePageLayout } from '../../../lib/api/pageLayout';
import { fetchCategories } from '../../../lib/api/categories';

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3220';

// Which settings fields each section type exposes — kept in sync with
// storefront-next's sectionRegistry.ts. Sections not listed here have no
// editable settings yet (Phase 1): only reorder and show/hide apply.
const SECTION_META = {
  hero_slider: { label: 'Hero Slider', fields: [] },
  explore_products: { label: 'Explore Products', fields: [] },
  categories_slider: { label: 'Categories Slider', fields: ['title'] },
  trending_products: { label: 'Trending Products', fields: ['title', 'category'] },
  video_section: { label: 'Video Section', fields: [] },
  reviews: { label: 'Customer Reviews', fields: ['title'] },
  feature_bar: { label: 'Feature Bar', fields: [] },
};

function getPayload(e) {
  try {
    return JSON.parse(e.dataTransfer.getData('text/plain'));
  } catch {
    return null;
  }
}

export default function ThemeEditorPage() {
  const [sections, setSections] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const iframeRef = useRef(null);
  const [previewReady, setPreviewReady] = useState(false);

  useEffect(() => {
    Promise.all([fetchPageLayout('home'), fetchCategories()])
      .then(([layout, cats]) => {
        setSections(layout.sections);
        setCategories(cats);
        if (layout.sections.length) setSelectedKey(layout.sections[0].key);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  // Keep the preview iframe in sync with every unsaved edit — the
  // storefront's HomeSectionsClient listens for this exact message shape.
  useEffect(() => {
    if (!previewReady || !sections) return;
    iframeRef.current?.contentWindow?.postMessage(
      { source: 'piaarya-theme-editor', sections },
      STOREFRONT_URL
    );
  }, [sections, previewReady]);

  function toggleVisible(key) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s)));
  }

  function updateSetting(key, field, value) {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, settings: { ...s.settings, [field]: value } } : s))
    );
  }

  function handleDragStart(e, index) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ index }));
  }

  function handleDrop(e, targetIndex) {
    e.preventDefault();
    const payload = getPayload(e);
    if (!payload || payload.index === targetIndex) return;
    setSections((prev) => {
      const next = [...prev];
      const [moved] = next.splice(payload.index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await savePageLayout('home', sections);
      setMessage('Saved.');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;

  const selected = sections?.find((s) => s.key === selectedKey);
  const selectedMeta = selected ? SECTION_META[selected.type] : null;
  // Mongoose can strip an empty `settings: {}` from a saved section (its
  // schema default), so this is never assumed to exist on load.
  const selectedSettings = selected?.settings || {};

  return (
    <div className="flex h-screen">
      <div className="w-72 shrink-0 border-r border-gray-100 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Theme Editor</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded-md disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <p className="px-4 pt-3 text-xs text-gray-400">Home page sections — drag to reorder.</p>
        {error && <p className="px-4 pt-2 text-xs text-red-600">{error}</p>}
        {message && <p className="px-4 pt-2 text-xs text-green-600">{message}</p>}

        <div className="flex-1 overflow-y-auto p-2">
          {sections.map((section, index) => (
            <div
              key={section.key}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => setSelectedKey(section.key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md cursor-pointer text-sm mb-1 ${
                selectedKey === section.key ? 'bg-gray-100' : 'hover:bg-gray-50'
              } ${!section.visible ? 'opacity-50' : ''}`}
            >
              <HugeiconsIcon icon={DragDropVerticalIcon} size={16} className="text-gray-400 shrink-0" />
              <span className="flex-1 truncate text-gray-900">
                {SECTION_META[section.type]?.label || section.type}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisible(section.key);
                }}
                title={section.visible ? 'Hide section' : 'Show section'}
                className="text-gray-400 hover:text-gray-700 shrink-0"
              >
                <HugeiconsIcon icon={section.visible ? ViewIcon : ViewOffIcon} size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-gray-100 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={STOREFRONT_URL}
          onLoad={() => setPreviewReady(true)}
          className="w-full h-full border-0"
          title="Storefront preview"
        />
      </div>

      <div className="w-80 shrink-0 border-l border-gray-100 bg-white overflow-y-auto">
        {selected ? (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{selectedMeta?.label}</h2>

            {selectedMeta?.fields.length === 0 && (
              <p className="text-sm text-gray-400">This section has no editable settings yet.</p>
            )}

            {selectedMeta?.fields.includes('title') && (
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">Title</label>
                <input
                  className="input"
                  value={selectedSettings.title || ''}
                  onChange={(e) => updateSetting(selected.key, 'title', e.target.value)}
                />
              </div>
            )}

            {selectedMeta?.fields.includes('category') && (
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <select
                  className="input"
                  value={selectedSettings.category || ''}
                  onChange={(e) => updateSetting(selected.key, 'category', e.target.value)}
                >
                  <option value="">All products</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Leave as "All products" to show products from every category.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="p-6 text-gray-400 text-sm">Select a section to edit its settings.</p>
        )}
      </div>
    </div>
  );
}
