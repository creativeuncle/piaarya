'use client';

import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DragDropVerticalIcon,
  ViewIcon,
  ViewOffIcon,
  Delete02Icon,
  PlusSignIcon,
  ShoppingBag01Icon,
  Grid2X2Icon,
  Image02Icon,
  Video01Icon,
  StarIcon,
  ListViewIcon,
  Mail01Icon,
  Contact01Icon,
} from '@hugeicons/core-free-icons';
import { fetchPageLayout, savePageLayout } from '../../../lib/api/pageLayout';
import { fetchCategories } from '../../../lib/api/categories';

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3220';

// Which settings fields each section type exposes, and how to render each
// field — kept in sync with storefront-next's component props. Sections
// with an empty `fields` array have nothing editable yet.
const SECTION_META = {
  hero_slider: { label: 'Hero Slider', fields: [] },
  explore_products: { label: 'Explore Products', fields: [] },
  categories_slider: {
    label: 'Categories Slider',
    fields: [{ key: 'title', label: 'Title', type: 'text' }],
  },
  trending_products: {
    label: 'Products Slider',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'category', label: 'Category', type: 'category' },
    ],
  },
  video_section: { label: 'Video', fields: [] },
  reviews: {
    label: 'Review Slider',
    fields: [{ key: 'title', label: 'Title', type: 'text' }],
  },
  feature_bar: { label: 'Feature Bar', fields: [] },
  image_with_text: {
    label: 'Image with Text',
    fields: [
      { key: 'imageUrl', label: 'Image URL', type: 'text' },
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'text', label: 'Text', type: 'textarea' },
      { key: 'buttonLabel', label: 'Button Label', type: 'text' },
      { key: 'buttonLink', label: 'Button Link', type: 'text' },
    ],
  },
  collapsible_content: {
    label: 'Collapsible Content',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'items', label: 'Questions', type: 'faq' },
    ],
  },
  email_subscriber: {
    label: 'Email Subscriber',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subtext', label: 'Subtext', type: 'textarea' },
      { key: 'buttonLabel', label: 'Button Label', type: 'text' },
    ],
  },
  contact_form: {
    label: 'Contact Form',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subtext', label: 'Subtext', type: 'textarea' },
    ],
  },
};

// Section types a store owner can add from scratch — more will be added
// here over time.
const ADDABLE_SECTIONS = [
  { type: 'trending_products', icon: ShoppingBag01Icon },
  { type: 'categories_slider', icon: Grid2X2Icon },
  { type: 'image_with_text', icon: Image02Icon },
  { type: 'video_section', icon: Video01Icon },
  { type: 'reviews', icon: StarIcon },
  { type: 'collapsible_content', icon: ListViewIcon },
  { type: 'email_subscriber', icon: Mail01Icon },
  { type: 'contact_form', icon: Contact01Icon },
];

function getPayload(e) {
  try {
    return JSON.parse(e.dataTransfer.getData('text/plain'));
  } catch {
    return null;
  }
}

const DEFAULT_FAQ_ITEMS = [
  { question: 'What is your return policy?', answer: 'You can return any item within 30 days of delivery for a full refund.' },
  { question: 'How long does shipping take?', answer: 'Orders are typically delivered within 3-5 business days.' },
  { question: 'Do you offer international shipping?', answer: 'Yes, we ship to most countries. Shipping costs are calculated at checkout.' },
];

// Each Q&A pair is its own collapsible block — matches how the sections
// list itself behaves, and keeps a long FAQ from turning into a wall of
// always-open fields.
function FaqEditor({ items, onChange }) {
  const list = items && items.length > 0 ? items : DEFAULT_FAQ_ITEMS;
  const [openIndex, setOpenIndex] = useState(0);

  function updateItem(i, field, value) {
    onChange(list.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    onChange([...list, { question: '', answer: '' }]);
    setOpenIndex(list.length);
  }

  function removeItem(i) {
    onChange(list.filter((_, idx) => idx !== i));
    setOpenIndex(null);
  }

  return (
    <div>
      {list.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-md mb-2 overflow-hidden">
          <div
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex items-center justify-between px-3 py-2 cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <span className="text-xs font-medium text-gray-700 truncate">
              {item.question || `Question ${i + 1}`}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(i);
                }}
                title="Remove question"
                className="text-gray-400 hover:text-red-600"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
              </button>
              <span className="text-gray-400 text-xs">{openIndex === i ? '−' : '+'}</span>
            </div>
          </div>
          {openIndex === i && (
            <div className="p-3 space-y-2">
              <input
                className="input"
                placeholder="Question"
                value={item.question || ''}
                onChange={(e) => updateItem(i, 'question', e.target.value)}
              />
              <textarea
                className="input"
                rows={3}
                placeholder="Answer"
                value={item.answer || ''}
                onChange={(e) => updateItem(i, 'answer', e.target.value)}
              />
            </div>
          )}
        </div>
      ))}
      <button onClick={addItem} className="btn-secondary w-full text-xs mt-1">
        + Add Question
      </button>
    </div>
  );
}

export default function ThemeEditorPage() {
  const [sections, setSections] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
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

  // Keep the preview iframe in sync with every unsaved edit, and with
  // which section is currently selected (so the preview can outline +
  // label it, same as Shopify's editor) — the storefront's
  // HomeSectionsClient listens for this exact message shape.
  useEffect(() => {
    if (!previewReady || !sections) return;
    const selectedSection = sections.find((s) => s.key === selectedKey);
    const selected = selectedSection
      ? { key: selectedSection.key, label: SECTION_META[selectedSection.type]?.label || selectedSection.type }
      : null;
    iframeRef.current?.contentWindow?.postMessage(
      { source: 'piaarya-theme-editor', sections, selected },
      STOREFRONT_URL
    );
  }, [sections, selectedKey, previewReady]);

  function toggleVisible(key) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s)));
  }

  function updateSetting(key, field, value) {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, settings: { ...s.settings, [field]: value } } : s))
    );
  }

  function addSection(type) {
    const newKey = `${type}_${Date.now()}`;
    setSections((prev) => [...prev, { key: newKey, type, visible: true, settings: {} }]);
    setSelectedKey(newKey);
    setShowAddModal(false);
  }

  function removeSection(key) {
    setSections((prev) => prev.filter((s) => s.key !== key));
    setSelectedKey((prev) => (prev === key ? null : prev));
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
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-md cursor-pointer text-sm mb-1 ${
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
                className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 shrink-0"
              >
                <HugeiconsIcon icon={section.visible ? ViewIcon : ViewOffIcon} size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSection(section.key);
                }}
                title="Remove section"
                className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shrink-0"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-gray-100">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700 px-3 py-2.5 rounded-md hover:bg-gray-50 border border-dashed border-gray-300"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            Add Section
          </button>
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

            {selectedMeta?.fields.map((field) => (
              <div className="mb-4" key={field.key}>
                <label className="block text-xs text-gray-500 mb-1">{field.label}</label>

                {field.type === 'text' && (
                  <input
                    className="input"
                    value={selectedSettings[field.key] || ''}
                    onChange={(e) => updateSetting(selected.key, field.key, e.target.value)}
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    className="input"
                    rows={3}
                    value={selectedSettings[field.key] || ''}
                    onChange={(e) => updateSetting(selected.key, field.key, e.target.value)}
                  />
                )}

                {field.type === 'faq' && (
                  <FaqEditor
                    items={selectedSettings.items}
                    onChange={(items) => updateSetting(selected.key, 'items', items)}
                  />
                )}

                {field.type === 'category' && (
                  <>
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
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="p-6 text-gray-400 text-sm">Select a section to edit its settings.</p>
        )}
      </div>

      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Section</h3>
            <div className="grid grid-cols-4 gap-3">
              {ADDABLE_SECTIONS.map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => addSection(type)}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-md border border-gray-200 hover:border-gray-900 hover:bg-gray-50 text-center"
                >
                  <HugeiconsIcon icon={icon} size={24} className="text-gray-700" />
                  <span className="text-xs text-gray-700 leading-tight">{SECTION_META[type]?.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowAddModal(false)} className="btn-secondary w-full mt-5">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
