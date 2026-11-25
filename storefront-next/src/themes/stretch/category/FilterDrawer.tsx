'use client';

import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import PriceRangeSlider from './PriceRangeSlider';

function CheckboxGroup({ title, options, selected, onToggle }) {
  if (!options?.length) return null;
  return (
    <div className="py-5 border-b border-[#3A2E1D]/15">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#3A2E1D] mb-3">{title}</p>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm text-[#3A2E1D]/80">
            <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function FilterDrawer({ open, onClose, facets, categories, appliedFilters, onApply }) {
  const [pending, setPending] = useState(appliedFilters);

  useEffect(() => {
    if (open) setPending(appliedFilters);
  }, [open, appliedFilters]);

  function toggle(field, value) {
    setPending((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((v) => v !== value) : [...prev[field], value],
    }));
  }

  function handleCancel() {
    setPending(appliedFilters);
    onClose();
  }

  function handleApply() {
    onApply(pending);
    onClose();
  }

  if (!facets) return null;

  return (
    <>
      <div
        onClick={handleCancel}
        className={`fixed inset-0 bg-[#3A2E1D]/50 z-40 transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        className={`fixed inset-y-0 left-0 w-full max-w-sm bg-[#EEDFBE] text-[#3A2E1D] z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#3A2E1D]/15">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3A2E1D]">All Filters</p>
          <button onClick={handleCancel} aria-label="Close filters" className="text-[#3A2E1D]">
            <HugeiconsIcon icon={Cancel01Icon} size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <CheckboxGroup
            title="Categories"
            options={categories.map((c) => c.name)}
            selected={categories.filter((c) => pending.categories.includes(c._id)).map((c) => c.name)}
            onToggle={(name) => {
              const category = categories.find((c) => c.name === name);
              toggle('categories', category._id);
            }}
          />

          <div className="py-5 border-b border-[#3A2E1D]/15">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#3A2E1D] mb-3">Price Range</p>
            <PriceRangeSlider
              min={facets.priceMin}
              max={facets.priceMax}
              valueMin={pending.priceMin}
              valueMax={pending.priceMax}
              onChange={(priceMin, priceMax) => setPending((prev) => ({ ...prev, priceMin, priceMax }))}
            />
          </div>

          <CheckboxGroup title="Size" options={facets.sizes} selected={pending.sizes} onToggle={(v) => toggle('sizes', v)} />
          <CheckboxGroup title="Color" options={facets.colors} selected={pending.colors} onToggle={(v) => toggle('colors', v)} />
          <CheckboxGroup title="Style" options={facets.styles} selected={pending.styles} onToggle={(v) => toggle('styles', v)} />
          <CheckboxGroup
            title="Material"
            options={facets.materials}
            selected={pending.materials}
            onToggle={(v) => toggle('materials', v)}
          />
          <CheckboxGroup
            title="Occasion"
            options={facets.occasions}
            selected={pending.occasions}
            onToggle={(v) => toggle('occasions', v)}
          />
        </div>

        <div className="border-t border-[#3A2E1D]/15 px-6 py-4 flex gap-3">
          <button onClick={handleCancel} className="flex-1 border border-[#3A2E1D]/30 text-[#3A2E1D] font-medium text-sm py-3 rounded-full uppercase tracking-wide">
            Cancel
          </button>
          <button onClick={handleApply} className="flex-1 border-2 border-[#3A2E1D] text-[#3A2E1D] font-semibold text-sm py-3 rounded-full uppercase tracking-wide hover:bg-[#3A2E1D]/10">
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
