import { useEffect, useState } from 'react';
import { PAGES } from '../constants/pages';
import { fetchNavigation, saveNavigation } from '../api/navigation';

function getPayload(e) {
  try {
    return JSON.parse(e.dataTransfer.getData('text/plain'));
  } catch {
    return null;
  }
}

export default function Navigation() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newColumnName, setNewColumnName] = useState({});

  useEffect(() => {
    fetchNavigation()
      .then((tree) =>
        setMenus(
          tree.map((m) => ({
            label: m.label,
            route: m.route,
            children: (m.children || []).map((c) => ({
              label: c.label,
              route: c.route,
              children: (c.children || []).map((g) => ({ label: g.label, route: g.route })),
            })),
          }))
        )
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const usedRoutes = new Set();
  menus.forEach((m) => {
    if (m.route) usedRoutes.add(m.route);
    m.children.forEach((c) => {
      if (c.route) usedRoutes.add(c.route);
      (c.children || []).forEach((g) => usedRoutes.add(g.route));
    });
  });
  const availablePages = PAGES.filter((p) => !usedRoutes.has(p.route));

  function addGroup() {
    if (!newGroupName.trim()) return;
    setMenus((prev) => [...prev, { label: newGroupName.trim(), route: '', children: [] }]);
    setNewGroupName('');
  }

  function addColumn(menuIndex) {
    const name = (newColumnName[menuIndex] || '').trim();
    if (!name) return;
    setMenus((prev) =>
      prev.map((m, i) => (i === menuIndex ? { ...m, children: [...m.children, { label: name, route: '', children: [] }] } : m))
    );
    setNewColumnName((prev) => ({ ...prev, [menuIndex]: '' }));
  }

  function removeTopLevel(index) {
    setMenus((prev) => prev.filter((_, i) => i !== index));
  }

  function removeChild(menuIndex, childIndex) {
    setMenus((prev) =>
      prev.map((m, i) => (i === menuIndex ? { ...m, children: m.children.filter((_, ci) => ci !== childIndex) } : m))
    );
  }

  function removeGrandchild(menuIndex, childIndex, grandchildIndex) {
    setMenus((prev) =>
      prev.map((m, mi) =>
        mi === menuIndex
          ? {
              ...m,
              children: m.children.map((c, ci) =>
                ci === childIndex ? { ...c, children: c.children.filter((_, gi) => gi !== grandchildIndex) } : c
              ),
            }
          : m
      )
    );
  }

  function handleDropOnRoot(e) {
    e.preventDefault();
    const payload = getPayload(e);
    if (!payload) return;
    if (payload.type === 'pool') {
      setMenus((prev) => [...prev, { label: payload.label, route: payload.route, children: [] }]);
    } else if (payload.type === 'top') {
      setMenus((prev) => {
        const next = [...prev];
        const [moved] = next.splice(payload.index, 1);
        next.push(moved);
        return next;
      });
    }
  }

  function handleDropOnMenuHeader(e, targetIndex) {
    e.preventDefault();
    e.stopPropagation();
    const payload = getPayload(e);
    if (!payload) return;
    if (payload.type === 'top') {
      setMenus((prev) => {
        const next = [...prev];
        const [moved] = next.splice(payload.index, 1);
        next.splice(targetIndex, 0, moved);
        return next;
      });
    } else if (payload.type === 'pool') {
      setMenus((prev) => {
        const next = [...prev];
        next.splice(targetIndex, 0, { label: payload.label, route: payload.route, children: [] });
        return next;
      });
    }
  }

  function handleDropOnChildrenZone(e, menuIndex) {
    e.preventDefault();
    e.stopPropagation();
    const payload = getPayload(e);
    if (!payload) return;
    if (payload.type === 'pool') {
      setMenus((prev) =>
        prev.map((m, i) =>
          i === menuIndex
            ? { ...m, children: [...m.children, { label: payload.label, route: payload.route, children: [] }] }
            : m
        )
      );
    } else if (payload.type === 'child') {
      setMenus((prev) => {
        const next = prev.map((m) => ({ ...m, children: [...m.children] }));
        const [moved] = next[payload.menuIndex].children.splice(payload.childIndex, 1);
        next[menuIndex].children.push(moved);
        return next;
      });
    }
  }

  function handleDropOnChildItem(e, menuIndex, targetChildIndex) {
    e.preventDefault();
    e.stopPropagation();
    const payload = getPayload(e);
    if (!payload) return;
    if (payload.type === 'child') {
      setMenus((prev) => {
        const next = prev.map((m) => ({ ...m, children: [...m.children] }));
        const [moved] = next[payload.menuIndex].children.splice(payload.childIndex, 1);
        next[menuIndex].children.splice(targetChildIndex, 0, moved);
        return next;
      });
    } else if (payload.type === 'pool') {
      setMenus((prev) => {
        const next = prev.map((m) => ({ ...m, children: [...m.children] }));
        next[menuIndex].children.splice(targetChildIndex, 0, { label: payload.label, route: payload.route, children: [] });
        return next;
      });
    }
  }

  function handleDropOnGrandchildrenZone(e, menuIndex, childIndex) {
    e.preventDefault();
    e.stopPropagation();
    const payload = getPayload(e);
    if (!payload) return;
    if (payload.type === 'pool') {
      setMenus((prev) =>
        prev.map((m, mi) =>
          mi === menuIndex
            ? {
                ...m,
                children: m.children.map((c, ci) =>
                  ci === childIndex ? { ...c, children: [...c.children, { label: payload.label, route: payload.route }] } : c
                ),
              }
            : m
        )
      );
    } else if (payload.type === 'grandchild') {
      setMenus((prev) => {
        const next = prev.map((m) => ({ ...m, children: m.children.map((c) => ({ ...c, children: [...c.children] })) }));
        const [moved] = next[payload.menuIndex].children[payload.childIndex].children.splice(payload.grandchildIndex, 1);
        next[menuIndex].children[childIndex].children.push(moved);
        return next;
      });
    }
  }

  function handleDropOnGrandchildItem(e, menuIndex, childIndex, targetGrandchildIndex) {
    e.preventDefault();
    e.stopPropagation();
    const payload = getPayload(e);
    if (!payload) return;
    if (payload.type === 'grandchild') {
      setMenus((prev) => {
        const next = prev.map((m) => ({ ...m, children: m.children.map((c) => ({ ...c, children: [...c.children] })) }));
        const [moved] = next[payload.menuIndex].children[payload.childIndex].children.splice(payload.grandchildIndex, 1);
        next[menuIndex].children[childIndex].children.splice(targetGrandchildIndex, 0, moved);
        return next;
      });
    } else if (payload.type === 'pool') {
      setMenus((prev) => {
        const next = prev.map((m) => ({ ...m, children: m.children.map((c) => ({ ...c, children: [...c.children] })) }));
        next[menuIndex].children[childIndex].children.splice(targetGrandchildIndex, 0, {
          label: payload.label,
          route: payload.route,
        });
        return next;
      });
    }
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Navigation</h1>
        <button onClick={handleSave} disabled={saving} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Navigation'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

      <p className="text-sm text-gray-500 mb-4">
        Drag a page from "Available Pages" into the menu area to make it a Menu, or drop it onto a menu's Sub-menu
        zone to nest it underneath as a Column, or into a Column to add it as an Item (for mega-menus like "Shop by
        Device" with IPHONE / MACBOOK / IPAD columns). Drag items to reorder them.
      </p>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Available Pages</h2>
          <div className="bg-white rounded-lg shadow border border-gray-100 p-3 space-y-2 min-h-[120px]">
            {availablePages.length === 0 && <p className="text-xs text-gray-400">All pages are placed in the menu.</p>}
            {availablePages.map((page) => (
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

          <div className="mt-4 flex gap-2">
            <input
              className="input"
              placeholder="New group name (e.g. Settings)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button onClick={addGroup} className="btn-secondary whitespace-nowrap">+ Add Group</button>
          </div>
        </div>

        <div className="col-span-2">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Menu Structure</h2>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnRoot}
            className="space-y-3 min-h-[300px] border-2 border-dashed border-gray-200 rounded-lg p-3"
          >
            {menus.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-10">Drag a page here to start building your menu.</p>
            )}
            {menus.map((menu, mi) => (
              <div key={mi} className="bg-white rounded-lg shadow border border-gray-100">
                <div
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'top', index: mi }))}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnMenuHeader(e, mi)}
                  className="flex items-center justify-between px-3 py-2 border-b border-gray-100 cursor-grab"
                >
                  <span className="text-sm font-medium text-gray-900">{menu.label}</span>
                  <button onClick={() => removeTopLevel(mi)} className="text-red-600 text-xs">Remove</button>
                </div>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnChildrenZone(e, mi)}
                  className="p-3 space-y-2 min-h-[48px]"
                >
                  {menu.children.length === 0 && (
                    <p className="text-xs text-gray-400">Drop a page here to add it as a sub-menu / column.</p>
                  )}
                  {menu.children.map((child, ci) => (
                    <div
                      key={ci}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'child', menuIndex: mi, childIndex: ci }))
                      }
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropOnChildItem(e, mi, ci)}
                      className="bg-gray-50 border border-gray-200 rounded-md ml-4"
                    >
                      <div className="flex items-center justify-between px-3 py-1.5 cursor-grab">
                        <span className="text-sm font-medium text-gray-700">{child.label}</span>
                        <button onClick={() => removeChild(mi, ci)} className="text-red-600 text-xs">×</button>
                      </div>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.stopPropagation();
                          handleDropOnGrandchildrenZone(e, mi, ci);
                        }}
                        className="px-3 pb-2 space-y-1 min-h-[32px]"
                      >
                        {(child.children || []).length === 0 && (
                          <p className="text-xs text-gray-400">Drop a page here to add it as an item in this column.</p>
                        )}
                        {(child.children || []).map((grandchild, gi) => (
                          <div
                            key={gi}
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              e.dataTransfer.setData(
                                'text/plain',
                                JSON.stringify({ type: 'grandchild', menuIndex: mi, childIndex: ci, grandchildIndex: gi })
                              );
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.stopPropagation();
                              handleDropOnGrandchildItem(e, mi, ci, gi);
                            }}
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-3 py-1 text-sm text-gray-600 cursor-grab ml-4"
                          >
                            <span>{grandchild.label}</span>
                            <button onClick={() => removeGrandchild(mi, ci, gi)} className="text-red-600 text-xs">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 ml-4">
                    <input
                      className="input text-sm"
                      placeholder="New column name (e.g. IPHONE)"
                      value={newColumnName[mi] || ''}
                      onChange={(e) => setNewColumnName((prev) => ({ ...prev, [mi]: e.target.value }))}
                    />
                    <button onClick={() => addColumn(mi)} className="btn-secondary whitespace-nowrap text-sm">+ Add Column</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
