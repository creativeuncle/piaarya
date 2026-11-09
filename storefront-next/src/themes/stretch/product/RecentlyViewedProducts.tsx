'use client';

import { useEffect, useState } from 'react';
import { fetchProduct } from '../../../lib/api/products';
import { getRecentlyViewed } from '../../../hooks/useRecentlyViewed';
import Carousel from '../../../components/Carousel';
import ProductTile from '../home/ProductTile';
import { DISPLAY_FONT } from '../styles';

export default function RecentlyViewedProducts({ excludeProductId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getRecentlyViewed(excludeProductId);
    if (!ids.length) {
      setLoading(false);
      return;
    }
    Promise.all(ids.map((id) => fetchProduct(id).catch(() => null)))
      .then((results) => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [excludeProductId]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-[#41473d] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <h2 className={`${DISPLAY_FONT} text-2xl text-white md:text-3xl mb-8`}>Recently Viewed</h2>
        {loading && <p className="text-white/50 text-sm">Loading...</p>}
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
