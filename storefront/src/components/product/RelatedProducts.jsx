import { useEffect, useState } from 'react';
import { fetchProducts } from '../../api/products';
import ProductCard from '../ProductCard';
import Carousel from '../Carousel';

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
    <section className="max-w-6xl mx-auto px-6 py-12 border-t border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
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
