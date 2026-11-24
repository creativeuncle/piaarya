'use client';

import { useEffect, useRef, useState } from 'react';
import { ROLE_META, roleLabel } from '../constants/teamRoles';

export default function RoleSelect({
  value,
  roles,
  onChange,
  disabled,
}: {
  value: string;
  roles: string[];
  onChange: (role: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const filtered = roles.filter((r) => {
    const meta = ROLE_META[r];
    const haystack = `${meta?.label || r} ${meta?.description || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <div ref={containerRef} className="relative inline-block w-full max-w-[220px]">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
      >
        <span className="truncate">{roleLabel(value)}</span>
        <span className="text-gray-400 shrink-0">▾</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            <p className="px-3 pt-2 pb-1 text-xs font-medium text-gray-500">Store roles</p>
            {filtered.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  onChange(r);
                  setOpen(false);
                  setSearch('');
                }}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${r === value ? 'bg-gray-50' : ''}`}
              >
                <p className="text-sm font-medium text-gray-900">{ROLE_META[r]?.label || r}</p>
                {ROLE_META[r]?.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{ROLE_META[r].description}</p>
                )}
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3 py-3 text-sm text-gray-400">No roles found.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
