'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';

const OPTIONS = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'newest', label: 'Newest' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
];

export default function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find((o) => o.key === value) || OPTIONS[0];

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-2 text-sm text-[#3A2E1D]">
        <span className="text-[#3A2E1D]/60">Sort by:</span>
        <span className="font-semibold">{current.label}</span>
        <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-[#3A2E1D]/15 bg-[#EEDFBE] shadow-xl">
            {OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  onChange(option.key);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#3A2E1D]/10 ${
                  option.key === value ? 'text-[#3A2E1D]' : 'text-[#3A2E1D]/70'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
