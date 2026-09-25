import { useEffect, useState } from 'react';
import { fetchProducts } from '../../api/products';
import ProductCard from '../ProductCard';
import Carousel from '../Carousel';

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ limit: 12 })
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Trending Now</h2>
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
