import { useState } from 'react';
import ImageUpload from './ImageUpload';

const ATTRIBUTES = ['Color', 'Size', 'Weight', 'Material'];
const FIELDS = ATTRIBUTES.map((a) => a.toLowerCase());

function cartesian(arrays) {
  return arrays.reduce((acc, values) => acc.flatMap((combo) => values.map((v) => [...combo, v])), [[]]);
}

function variantKey(v) {
  return FIELDS.map((f) => v[f] || '').join('|');
}

function regenerate(options, existingVariants) {
  if (!options.length) return [];
  const fieldNames = options.map((o) => o.name.toLowerCase());
  const combos = cartesian(options.map((o) => o.values));
  return combos.map((combo) => {
    const base = { color: '', size: '', weight: '', material: '', price: '', sku: '', stock: '', image: '' };
    fieldNames.forEach((f, i) => {
      base[f] = combo[i];
    });
    const existing = existingVariants.find((v) => variantKey(v) === variantKey(base));
    return existing
      ? { ...base, price: existing.price, sku: existing.sku, stock: existing.stock, image: existing.image }
      : base;
  });
}

function variantLabel(variant, options) {
  return options.map((o) => variant[o.name.toLowerCase()]).filter(Boolean).join(' / ');
}

export default function VariantOptions({ options, variants, onChange }) {
  const [addingOption, setAddingOption] = useState(null);

  const usedNames = options.map((o) => o.name);
  const availableAttrs = ATTRIBUTES.filter((a) => !usedNames.includes(a));

  function startAddOption() {
    if (!availableAttrs.length) return;
    setAddingOption({ name: availableAttrs[0], values: [], valueInput: '' });
  }

  function commitOption() {
    if (!addingOption?.name || !addingOption.values.length) return;
    const newOptions = [...options, { name: addingOption.name, values: addingOption.values }];
    onChange(newOptions, regenerate(newOptions, variants));
    setAddingOption(null);
  }

  function addPendingValue() {
    const val = addingOption.valueInput.trim();
    if (!val || addingOption.values.includes(val)) return;
    setAddingOption({ ...addingOption, values: [...addingOption.values, val], valueInput: '' });
  }

  function removeOption(index) {
    const newOptions = options.filter((_, i) => i !== index);
    onChange(newOptions, regenerate(newOptions, variants));
  }

  function addValueToOption(optionIndex, value) {
    const val = value.trim();
    if (!val || options[optionIndex].values.includes(val)) return;
    const newOptions = options.map((o, i) => (i === optionIndex ? { ...o, values: [...o.values, val] } : o));
    onChange(newOptions, regenerate(newOptions, variants));
  }

  function removeValueFromOption(optionIndex, valueIndex) {
    const newOptions = options.map((o, i) =>
      i === optionIndex ? { ...o, values: o.values.filter((_, vi) => vi !== valueIndex) } : o
    );
    onChange(newOptions, regenerate(newOptions, variants));
  }

  function updateVariantField(index, field, value) {
    onChange(
      options,
      variants.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  return (
    <div>
      {options.map((option, oi) => (
        <div key={option.name} className="border border-gray-200 rounded-md p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{option.name}</span>
            <button type="button" onClick={() => removeOption(oi)} className="text-red-600 text-xs">
              Delete
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {option.values.map((value, vi) => (
              <span
                key={value}
                className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700"
              >
                {value}
                <button type="button" onClick={() => removeValueFromOption(oi, vi)} className="text-gray-400 hover:text-red-600">
                  ×
                </button>
              </span>
            ))}
          </div>
          <AddValueInput onAdd={(val) => addValueToOption(oi, val)} />
        </div>
      ))}

      {addingOption && (
        <div className="border border-gray-300 rounded-md p-3 mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Option name</label>
          <select
            className="input mb-2"
            value={addingOption.name}
            onChange={(e) => setAddingOption({ ...addingOption, name: e.target.value })}
          >
            {availableAttrs.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <label className="block text-sm font-medium text-gray-700 mb-1">Option values</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {addingOption.values.map((value, vi) => (
              <span
                key={value}
                className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700"
              >
                {value}
                <button
                  type="button"
                  onClick={() =>
                    setAddingOption({ ...addingOption, values: addingOption.values.filter((_, i) => i !== vi) })
                  }
                  className="text-gray-400 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            className="input"
            placeholder="Add a value and press Enter"
            value={addingOption.valueInput}
            onChange={(e) => setAddingOption({ ...addingOption, valueInput: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addPendingValue();
              }
            }}
          />
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={commitOption} className="bg-gray-900 text-white text-sm px-4 py-1.5 rounded-md">
              Done
            </button>
            <button type="button" onClick={() => setAddingOption(null)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {!addingOption && availableAttrs.length > 0 && (
        <button type="button" onClick={startAddOption} className="btn-secondary mb-4">
          + Add options like size or color
        </button>
      )}

      {variants.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-3 py-2">Variant</th>
                <th className="px-3 py-2">Image</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">SKU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variants.map((variant, vi) => (
                <tr key={variantKey(variant)}>
                  <td className="px-3 py-2 font-medium text-gray-900">{variantLabel(variant, options)}</td>
                  <td className="px-3 py-2">
                    <ImageUpload value={variant.image} onChange={(url) => updateVariantField(vi, 'image', url)} />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="input"
                      value={variant.price}
                      onChange={(e) => updateVariantField(vi, 'price', e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="input"
                      value={variant.stock}
                      onChange={(e) => updateVariantField(vi, 'stock', e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="input"
                      value={variant.sku}
                      onChange={(e) => updateVariantField(vi, 'sku', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AddValueInput({ onAdd }) {
  const [value, setValue] = useState('');
  return (
    <input
      className="input"
      placeholder="Add another value"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          const val = value.trim();
          if (val) {
            onAdd(val);
            setValue('');
          }
        }
      }}
    />
  );
}

export function deriveOptionsFromVariants(variants) {
  const options = [];
  FIELDS.forEach((field, i) => {
    const values = [];
    variants.forEach((v) => {
      if (v[field] && !values.includes(v[field])) values.push(v[field]);
    });
    if (values.length) options.push({ name: ATTRIBUTES[i], values });
  });
  return options;
}
