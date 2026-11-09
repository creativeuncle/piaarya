'use client';

import { useEffect, useState } from 'react';
import { fetchProducts } from '../../../lib/api/products';
import { MID_BG, DISPLAY_FONT, EYEBROW } from '../styles';
import ProductTile from './ProductTile';

const TABS = [
  { key: 'bestseller', label: 'Best Sellers' },
  { key: 'new', label: 'New In' },
  { key: 'bundle', label: 'Bundles' },
];

export default function ExploreProducts() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProducts({ tag: activeTab, limit: 8 })
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <section className={`${MID_BG} py-20`}>
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col items-center text-center">
          <p className={EYEBROW}>Explore</p>
          <h2 className={`${DISPLAY_FONT} mt-2 text-3xl text-white md:text-4xl`}>Find your everyday fit</h2>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 border-b border-white/15">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative pb-4 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                activeTab === tab.key ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-white" />}
            </button>
          ))}
        </div>

        {loading && <p className="mt-12 text-center text-white/50 text-sm">Loading...</p>}
        {!loading && products.length === 0 && (
          <p className="mt-12 text-center text-white/50 text-sm">No products in this tab yet.</p>
        )}
        {!loading && products.length > 0 && (
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {products.map((product) => (
              <ProductTile key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
