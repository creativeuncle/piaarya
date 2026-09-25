import { useEffect, useState } from 'react';

export default function VariantSelector({ variants, onChange }) {
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];

  const [selectedColor, setSelectedColor] = useState(colors[0] || null);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);

  useEffect(() => {
    const match = variants.find(
      (v) => (!colors.length || v.color === selectedColor) && (!sizes.length || v.size === selectedSize)
    );
    onChange(match || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor, selectedSize]);

  function isSizeAvailable(size) {
    return variants.some((v) => (!colors.length || v.color === selectedColor) && v.size === size && v.stock > 0);
  }

  if (!variants.length) return null;

  return (
    <div className="space-y-4">
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Color: <span className="font-normal text-gray-500">{selectedColor}</span></p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 rounded-md text-sm border ${
                  selectedColor === color ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-700 hover:border-gray-500'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Size: <span className="font-normal text-gray-500">{selectedSize}</span></p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const available = isSizeAvailable(size);
              return (
                <button
                  key={size}
                  onClick={() => available && setSelectedSize(size)}
                  disabled={!available}
                  className={`px-4 py-2 rounded-md text-sm border ${
                    selectedSize === size
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : available
                      ? 'border-gray-300 text-gray-700 hover:border-gray-500'
                      : 'border-gray-200 text-gray-300 line-through cursor-not-allowed'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
