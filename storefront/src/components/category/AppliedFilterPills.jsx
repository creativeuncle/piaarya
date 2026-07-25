import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

function Pill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 text-sm text-gray-800">
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label} filter`}>
        <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.5} />
      </button>
    </span>
  );
}

export default function AppliedFilterPills({ filters, categories, facets, onChange }) {
  if (!facets) return null;

  const pills = [];

  filters.categories.forEach((id) => {
    const category = categories.find((c) => c._id === id);
    if (category) pills.push({ key: `category-${id}`, label: category.name, onRemove: () => onChange({ ...filters, categories: filters.categories.filter((c) => c !== id) }) });
  });

  ['sizes', 'colors', 'styles', 'materials', 'occasions'].forEach((field) => {
    filters[field].forEach((value) => {
      pills.push({
        key: `${field}-${value}`,
        label: value,
        onRemove: () => onChange({ ...filters, [field]: filters[field].filter((v) => v !== value) }),
      });
    });
  });

  if (filters.priceMin > facets.priceMin || filters.priceMax < facets.priceMax) {
    pills.push({
      key: 'price',
      label: `₹${filters.priceMin} - ₹${filters.priceMax}`,
      onRemove: () => onChange({ ...filters, priceMin: facets.priceMin, priceMax: facets.priceMax }),
    });
  }

  if (!pills.length) return null;

  function clearAll() {
    onChange({
      categories: [],
      sizes: [],
      colors: [],
      styles: [],
      materials: [],
      occasions: [],
      priceMin: facets.priceMin,
      priceMax: facets.priceMax,
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {pills.map((pill) => (
        <Pill key={pill.key} label={pill.label} onRemove={pill.onRemove} />
      ))}
      <button onClick={clearAll} className="text-sm text-gray-500 underline ml-2">
        Clear All
      </button>
    </div>
  );
}
