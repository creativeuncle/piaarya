'use client';

import { useEffect, useState } from 'react';
import { fetchProducts } from '../../../lib/api/products';
import ProductCard from '../../../components/ProductCard';
import Carousel from '../../../components/Carousel';

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
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{title}</h2>
      {loading && <p className="text-gray-400 text-sm">Loading...</p>}
      {!loading && (
        <Carousel>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </Carousel>
      )}
    </section>
  );
}
