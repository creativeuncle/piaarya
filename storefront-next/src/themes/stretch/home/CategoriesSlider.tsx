'use client';

import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { fetchCategories } from '../../../lib/api/categories';
import { DARK_BG, DISPLAY_FONT, EYEBROW } from '../styles';

export default function CategoriesSlider({ title = 'Shop by Category' }: { title?: string }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then((all) => setCategories(all.filter((c) => !c.parent)))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && categories.length === 0) return null;

  return (
    <section className={`${DARK_BG} py-16 md:py-20`}>
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-10 text-center">
          <p className={EYEBROW}>Collections</p>
          <h2 className={`${DISPLAY_FONT} mt-2 text-3xl text-white md:text-4xl`}>{title}</h2>
        </div>

        {loading && <p className="text-center text-white/50 text-sm">Loading...</p>}
        {!loading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <a
                key={category._id}
                href={`/products?category=${category._id}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
              >
                {category.image ? (
                  <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full bg-white/10" />
                )}
                <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-[#41473d]/80 py-1.5 pl-3 pr-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white shadow-md backdrop-blur">
                    {category.name}
                    <HugeiconsIcon icon={ArrowRight02Icon} size={14} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
