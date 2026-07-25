import { useEffect, useState } from 'react';
import { fetchProduct } from '../../api/products';
import { getRecentlyViewed } from '../../hooks/useRecentlyViewed';
import ProductCard from '../ProductCard';
import Carousel from '../Carousel';

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
    <section className="max-w-6xl mx-auto px-6 py-12 border-t border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
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
