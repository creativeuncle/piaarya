import { useEffect, useState } from 'react';
import { fetchCategories } from '../../api/categories';
import Carousel from '../Carousel';

export default function CategoriesSlider() {
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
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h2>
      {loading && <p className="text-gray-400 text-sm">Loading...</p>}
      {!loading && (
        <Carousel>
          {categories.map((category) => (
            <div key={category._id} className="shrink-0 w-56 snap-start text-center">
              <div className="bg-gray-100 aspect-square rounded-full overflow-hidden mb-3">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    {category.name}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900">{category.name}</p>
            </div>
          ))}
        </Carousel>
      )}
    </section>
  );
}
