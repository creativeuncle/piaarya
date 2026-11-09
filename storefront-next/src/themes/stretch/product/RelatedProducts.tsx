'use client';

import { useEffect, useState } from 'react';
import { fetchProducts } from '../../../lib/api/products';
import Carousel from '../../../components/Carousel';
import ProductTile from '../home/ProductTile';
import { DISPLAY_FONT } from '../styles';

export default function RelatedProducts({ categoryId, excludeProductId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) {
      setLoading(false);
      return;
    }
    fetchProducts({ category: categoryId, limit: 9 })
      .then((data) => setProducts(data.products.filter((p) => p._id !== excludeProductId).slice(0, 8)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [categoryId, excludeProductId]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-[#646c5f] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <h2 className={`${DISPLAY_FONT} text-2xl text-white md:text-3xl mb-8`}>You May Also Like</h2>
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
