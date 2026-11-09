'use client';

import { useEffect, useState } from 'react';
import type { ProductVariant } from '../../../types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  onChange: (variant: ProductVariant | null) => void;
}

export default function VariantSelector({ variants, onChange }: VariantSelectorProps) {
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];

  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] || null);

  useEffect(() => {
    const match = variants.find(
      (v) => (!colors.length || v.color === selectedColor) && (!sizes.length || v.size === selectedSize)
    );
    onChange(match || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor, selectedSize]);

  function isSizeAvailable(size: string) {
    return variants.some((v) => (!colors.length || v.color === selectedColor) && v.size === size && (v.stock ?? 0) > 0);
  }

  if (!variants.length) return null;

  return (
    <div className="space-y-5">
      {colors.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60 mb-2">
            Color: <span className="normal-case font-normal text-white">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 rounded-full text-sm border ${
                  selectedColor === color ? 'border-white bg-white text-[#41473d] font-semibold' : 'border-white/30 text-white hover:border-white'
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
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60 mb-2">
            Size: <span className="normal-case font-normal text-white">{selectedSize}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const available = isSizeAvailable(size);
              return (
                <button
                  key={size}
                  onClick={() => available && setSelectedSize(size)}
                  disabled={!available}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                    selectedSize === size
                      ? 'border-white bg-white text-[#41473d]'
                      : available
                      ? 'border-white/30 text-white hover:border-white'
                      : 'border-white/10 text-white/25 line-through cursor-not-allowed'
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
