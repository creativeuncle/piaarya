'use client';

import { useEffect, useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DragDropVerticalIcon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  Delete02Icon,
  PlusSignIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { fetchNavigation, saveNavigation } from '../../../../lib/api/navigation';
import { fetchCategories } from '../../../../lib/api/categories';
import { fetchPages } from '../../../../lib/api/pages';

const STATIC_LINKS = [
  { label: 'Home', route: '/' },
  { label: 'All products', route: '/products' },
  { label: 'Cart', route: '/cart' },
  { label: 'Search', route: '/search' },
];

function getPayload(e) {
  try {
    return JSON.parse(e.dataTransfer.getData('text/plain'));
  } catch {
    return null;
  }
}

function cloneTree(tree) {
  return tree.map((n) => ({ label: n.label, route: n.route || '', children: cloneTree(n.children || []) }));
}

function pathsEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function getChildrenAtParentPath(tree, parentPath) {
  let children = tree;
  for (const idx of parentPath) {
    children = children[idx].children;
  }
  return children;
}

function getNodeAtPath(tree, path) {
  const parentPath = path.slice(0, -1);
  const idx = path[path.length - 1];
  return getChildrenAtParentPath(tree, parentPath)[idx];
}

function removeAtPath(tree, path) {
  const parentPath = path.slice(0, -1);
  const idx = path[path.length - 1];
  const siblings = getChildrenAtParentPath(tree, parentPath);
  const [removed] = siblings.splice(idx, 1);
  return removed;
}

function insertAtParentPath(tree, parentPath, index, node) {
  const siblings = getChildrenAtParentPath(tree, parentPath);
  siblings.splice(index, 0, node);
}

function updateAtPath(tree, path, updates) {
  const parentPath = path.slice(0, -1);
  const idx = path[path.length - 1];
  const siblings = getChildrenAtParentPath(tree, parentPath);
  siblings[idx] = { ...siblings[idx], ...updates };
}

function moveNode(tree, sourcePath, targetParentPath, targetIndex) {
  const clone = cloneTree(tree);
  const sourceParentPath = sourcePath.slice(0, -1);
  const sourceIndex = sourcePath[sourcePath.length - 1];
  // Never drop a node into its own subtree.
  if (pathsEqual(sourcePath, targetParentPath.slice(0, sourcePath.length))) return tree;
  const removed = removeAtPath(clone, sourcePath);
  let insertIndex = targetIndex;
  if (pathsEqual(sourceParentPath, targetParentPath) && sourceIndex < targetIndex) {
    insertIndex -= 1;
  }
  insertAtParentPath(clone, targetParentPath, insertIndex, removed);
  return clone;
}

function insertNewNode(tree, parentPath, index, node) {
  const clone = cloneTree(tree);
  insertAtParentPath(clone, parentPath, index, node);
  return clone;
}

function LinkPicker({ label, route, onChange, suggestions }) {
  const [labelValue, setLabelValue] = useState(label);
  const [routeValue, setRouteValue] = useState(route);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => setLabelValue(label), [label]);
  useEffect(() => setRouteValue(route), [route]);

  const filtered = useMemo(() => {
    if (!routeValue) return suggestions.slice(0, 8);
    const q = routeValue.toLowerCase();
    return suggestions.filter((s) => s.label.toLowerCase().includes(q) || s.route.toLowerCase().includes(q)).slice(0, 8);
  }, [routeValue, suggestions]);

  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">Label</label>
        <input
          className="input text-sm"
          placeholder="e.g., About us"
          value={labelValue}
          onChange={(e) => {
            setLabelValue(e.target.value);
            onChange(e.target.value, routeValue);
          }}
        />
      </div>
      <div className="flex-1 relative">
        <label className="block text-xs text-gray-500 mb-1">Link</label>
        <input
          className="input text-sm"
          placeholder="Search or paste link"
          value={routeValue}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onChange={(e) => {
            setRouteValue(e.target.value);
            onChange(labelValue, e.target.value);
          }}
        />
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-auto">
            {filtered.map((s) => (
              <button
                key={s.route + s.label}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setLabelValue((prev) => prev || s.label);
                  setRouteValue(s.route);
                  onChange(labelValue || s.label, s.route);
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="text-gray-700">{s.label}</span>
                <span className="text-gray-400 text-xs">{s.route}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddItemRow({ depth, suggestions, onSave, onCancel }) {
  const [label, setLabel] = useState('');
  const [route, setRoute] = useState('');

  return (
    <div
      className="flex items-end gap-2 bg-white border border-gray-200 rounded-md px-3 py-2"
      style={{ marginLeft: depth * 24 }}
    >
      <span className="w-4 shrink-0" />
      <LinkPicker label={label} route={route} suggestions={suggestions} onChange={(l, r) => { setLabel(l); setRoute(r); }} />
      <button
        type="button"
        disabled={!label.trim()}
        onClick={() => onSave(label.trim(), route.trim())}
        className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 text-green-600 hover:bg-green-50 hover:border-green-200 disabled:opacity-40 shrink-0"
        title="Save"
      >
        <HugeiconsIcon icon={Tick02Icon} size={16} />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shrink-0"
        title="Cancel"
      >
        <HugeiconsIcon icon={Delete02Icon} size={16} />
      </button>
    </div>
  );
}

function MenuNodeRow({ node, path, depth, suggestions, editingKey, setEditingKey, addingKey, setAddingKey, collapsed, setCollapsed, onDrop, onDragStartNode, onSaveEdit, onRemove, onAddChild }) {
  const key = path.join('-');
  const isEditing = editingKey === key;
  const isAdding = addingKey === key;
  const isCollapsed = collapsed.has(key);
  const hasChildren = (node.children || []).length > 0;

  return (
    <div style={{ marginLeft: depth * 24 }}>
      {isEditing ? (
        <div className="flex items-end gap-2 bg-white border border-blue-200 rounded-md px-3 py-2">
          <span className="w-4 shrink-0" />
          <LinkPicker
            label={node.label}
            route={node.route}
            suggestions={suggestions}
            onChange={(l, r) => onSaveEdit(path, l, r, false)}
          />
          <button
            type="button"
            onClick={() => setEditingKey(null)}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 text-green-600 hover:bg-green-50 hover:border-green-200 shrink-0"
            title="Done"
          >
            <HugeiconsIcon icon={Tick02Icon} size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              onRemove(path);
              setEditingKey(null);
            }}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shrink-0"
            title="Delete"
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} />
          </button>
        </div>
      ) : (
        <div
          draggable
          onDragStart={(e) => onDragStartNode(e, path)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(e, path.slice(0, -1), path[path.length - 1])}
          className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md px-2 py-2 cursor-grab hover:border-gray-300"
        >
          <span className="text-gray-400 shrink-0">
            <HugeiconsIcon icon={DragDropVerticalIcon} size={16} />
          </span>
          <button
            type="button"
            onClick={() => hasChildren && setCollapsed((prev) => {
              const next = new Set(prev);
              if (next.has(key)) next.delete(key); else next.add(key);
              return next;
            })}
            className={`shrink-0 text-gray-400 ${hasChildren ? 'hover:text-gray-700' : 'opacity-0 cursor-default'}`}
          >
            <HugeiconsIcon icon={isCollapsed ? ArrowRight01Icon : ArrowDown01Icon} size={16} />
          </button>
          <button
            type="button"
            onClick={() => setEditingKey(key)}
            className="flex-1 text-left text-sm text-gray-800 py-0.5"
          >
            {node.label}
          </button>
          <button
            type="button"
            onClick={() => onRemove(path)}
            className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shrink-0"
            title="Remove"
          >
            <HugeiconsIcon icon={Delete02Icon} size={14} />
          </button>
        </div>
      )}

      {!isCollapsed && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(e, path, (node.children || []).length)}
          className="mt-2 space-y-2 pl-6 border-l border-gray-200 ml-2"
        >
          {(node.children || []).map((child, ci) => (
            <MenuNodeRow
              key={ci}
              node={child}
              path={[...path, ci]}
              depth={0}
              suggestions={suggestions}
              editingKey={editingKey}
              setEditingKey={setEditingKey}
              addingKey={addingKey}
              setAddingKey={setAddingKey}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              onDrop={onDrop}
              onDragStartNode={onDragStartNode}
              onSaveEdit={onSaveEdit}
              onRemove={onRemove}
              onAddChild={onAddChild}
            />
          ))}

          {isAdding ? (
            <AddItemRow
              depth={0}
              suggestions={suggestions}
              onSave={(l, r) => onAddChild(path, l, r)}
              onCancel={() => setAddingKey(null)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingKey(key)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 px-1 py-1"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={14} />
              Add menu item to <span className="font-medium">{node.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Navigation() {
  const [menus, setMenus] = useState([]);
  const [categoryPages, setCategoryPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [editingKey, setEditingKey] = useState(null);
  const [addingKey, setAddingKey] = useState(null);
  const [collapsed, setCollapsed] = useState(new Set());

  useEffect(() => {
    Promise.all([fetchNavigation(), fetchCategories(), fetchPages().catch(() => [])])
      .then(([tree, categories, pages]) => {
        function normalize(nodes) {
          return (nodes || []).map((n) => ({ label: n.label, route: n.route || '', children: normalize(n.children) }));
        }
        setMenus(normalize(tree));
        setCategoryPages([
          ...STATIC_LINKS,
          ...categories.map((c) => ({ label: c.name, route: `/products?category=${c._id}` })),
          ...(pages || []).map((p) => ({ label: p.title, route: `/pages/${p.slug}` })),
        ]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function onDragStartNode(e, path) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'node', path }));
  }

  function onDrop(e, targetParentPath, targetIndex) {
    e.preventDefault();
    e.stopPropagation();
    const payload = getPayload(e);
    if (!payload) return;
    if (payload.type === 'node') {
      setMenus((prev) => moveNode(prev, payload.path, targetParentPath, targetIndex));
    } else if (payload.type === 'pool') {
      setMenus((prev) => insertNewNode(prev, targetParentPath, targetIndex, { label: payload.label, route: payload.route, children: [] }));
    }
  }

  function onSaveEdit(path, label, route) {
    setMenus((prev) => {
      const clone = cloneTree(prev);
      updateAtPath(clone, path, { label, route });
      return clone;
    });
  }

  function onRemove(path) {
    setMenus((prev) => {
      const clone = cloneTree(prev);
      removeAtPath(clone, path);
      return clone;
    });
  }

  function onAddChild(parentPath, label, route) {
    if (!label) return;
    setMenus((prev) => insertNewNode(prev, parentPath, getChildrenAtParentPath(prev, parentPath).length, { label, route, children: [] }));
    setAddingKey(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await saveNavigation(menus);
      setMessage('Navigation saved.');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Main menu</h1>
        <button onClick={handleSave} disabled={saving} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Navigation'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

      <p className="text-sm text-gray-500 mb-4">
        Drag items by the handle to reorder, or drop one onto another to nest it as a sub-menu. Click any item to
        edit its label or link, or use "Add menu item" to add a new one at any level — nested as deep as you like.
      </p>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Quick add</h2>
          <div className="bg-white rounded-lg shadow border border-gray-100 p-3 space-y-2 min-h-[120px]">
            <p className="text-xs text-gray-400 mb-1">Drag into the menu, or use "Add menu item" below.</p>
            {categoryPages.map((page) => (
              <div
                key={page.route}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'pool', ...page }))}
                className="cursor-grab bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700"
              >
                {page.label}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Menu items</h2>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, [], menus.length)}
            className="space-y-2 min-h-[200px] border border-gray-200 rounded-lg p-3 bg-white"
          >
            {menus.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-10">Add a menu item to start building your menu.</p>
            )}
            {menus.map((node, i) => (
              <MenuNodeRow
                key={i}
                node={node}
                path={[i]}
                depth={0}
                suggestions={categoryPages}
                editingKey={editingKey}
                setEditingKey={setEditingKey}
                addingKey={addingKey}
                setAddingKey={setAddingKey}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                onDrop={onDrop}
                onDragStartNode={onDragStartNode}
                onSaveEdit={onSaveEdit}
                onRemove={onRemove}
                onAddChild={onAddChild}
              />
            ))}

            {addingKey === 'root' ? (
              <AddItemRow
                depth={0}
                suggestions={categoryPages}
                onSave={(l, r) => onAddChild([], l, r)}
                onCancel={() => setAddingKey(null)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setAddingKey('root')}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 px-1 py-1"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={14} />
                Add menu item
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
