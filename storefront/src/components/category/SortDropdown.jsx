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
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700"
      >
        Sort by: <span className="font-medium text-gray-900">{current.label}</span>
        <HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={1.5} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[180px] z-20">
            {OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  onChange(option.key);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  option.key === value ? 'font-semibold text-gray-900' : 'text-gray-600'
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
