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
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#3A2E1D]/60 mb-2">
            Color: <span className="normal-case font-normal text-[#3A2E1D]">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 rounded-full text-sm border ${
                  selectedColor === color ? 'border-[#3A2E1D] bg-[#3A2E1D] text-white font-semibold' : 'border-[#3A2E1D]/30 text-[#3A2E1D] hover:border-[#3A2E1D]'
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
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#3A2E1D]/60 mb-2">
            Size: <span className="normal-case font-normal text-[#3A2E1D]">{selectedSize}</span>
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
                      ? 'border-[#3A2E1D] bg-[#3A2E1D] text-white'
                      : available
                      ? 'border-[#3A2E1D]/30 text-[#3A2E1D] hover:border-[#3A2E1D]'
                      : 'border-[#3A2E1D]/10 text-[#3A2E1D]/25 line-through cursor-not-allowed'
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
