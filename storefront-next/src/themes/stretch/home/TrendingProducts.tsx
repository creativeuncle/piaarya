'use client';

import { useEffect, useState } from 'react';
import { fetchProducts } from '../../../lib/api/products';
import Carousel from '../../../components/Carousel';
import { MID_BG, DISPLAY_FONT, EYEBROW } from '../styles';
import ProductTile from './ProductTile';

export default function TrendingProducts({
  title = 'Trending Now',
  category,
}: {
  title?: string;
  category?: string;
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: { limit: number; category?: string } = { limit: 12 };
    if (category) params.category = category;
    fetchProducts(params)
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category]);

  if (!loading && products.length === 0) return null;

  return (
    <section className={`${MID_BG} py-16 md:py-20`}>
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-10 text-center">
          <p className={EYEBROW}>Just In</p>
          <h2 className={`${DISPLAY_FONT} mt-2 text-3xl text-white md:text-4xl`}>{title}</h2>
        </div>
        {loading && <p className="text-center text-white/50 text-sm">Loading...</p>}
        {!loading && (
          <Carousel>
            {products.map((product) => (
              <ProductTile key={product._id} product={product} className="shrink-0 w-56 snap-start" />
            ))}
          </Carousel>
        )}
      </div>
    </section>
  );
}
