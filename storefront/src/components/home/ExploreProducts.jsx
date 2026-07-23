import { useEffect, useState } from 'react';
import { fetchProducts } from '../../api/products';
import ProductCard from '../ProductCard';
import Carousel from '../Carousel';

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
    fetchProducts({ tag: activeTab, limit: 12 })
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-4xl font-black text-center tracking-tight">EXPLORE</h2>
      <div className="flex justify-center gap-8 mt-6 mb-10 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-semibold uppercase tracking-wide border-b-2 -mb-px ${
              activeTab === tab.key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-gray-400 text-sm">Loading...</p>}
      {!loading && products.length === 0 && (
        <p className="text-center text-gray-400 text-sm">No products in this tab yet.</p>
      )}
      {!loading && products.length > 0 && (
        <Carousel>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </Carousel>
      )}
    </section>
  );
}
