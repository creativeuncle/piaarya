'use client';

import Link from 'next/link';
import { useCurrency } from '../../../context/CurrencyContext';
import { DISPLAY_FONT } from '../styles';

export default function ProductTile({ product, className = '' }) {
  const { formatPrice } = useCurrency();
  const image = product.media?.[0]?.url;

  return (
    <Link href={`/products/${product._id}`} className={`block group ${className}`}>
      <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-white/5">
        {image ? (
          <img
            src={image}
            alt={product.media[0].altText || product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.15em] text-white/50">
            {product.name}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <h3 className={`${DISPLAY_FONT} text-lg text-white truncate`}>{product.name}</h3>
        <span className="text-sm font-medium text-white/70 shrink-0 ml-2">{formatPrice(product.price)}</span>
      </div>
    </Link>
  );
}
