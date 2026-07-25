import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { PreferenceHorizontalIcon } from '@hugeicons/core-free-icons';
import { fetchProducts, fetchProductFacets } from '../api/products';
import { fetchCategories } from '../api/categories';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import FilterDrawer from '../components/category/FilterDrawer';
import AppliedFilterPills from '../components/category/AppliedFilterPills';
import SortDropdown from '../components/category/SortDropdown';

const PAGE_SIZE = 28;

const EMPTY_FILTERS = {
  categories: [],
  sizes: [],
  colors: [],
  styles: [],
  materials: [],
  occasions: [],
  priceMin: 0,
  priceMax: 0,
};

export default function ProductListing() {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [facets, setFacets] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('relevance');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProductFacets()]).then(([allCategories, allFacets]) => {
      setCategories(allCategories.filter((c) => !c.parent));
      setFacets(allFacets);
      const categoryFromUrl = searchParams.get('category');
      setFilters({
        ...EMPTY_FILTERS,
        categories: categoryFromUrl ? [categoryFromUrl] : [],
        priceMin: allFacets.priceMin,
        priceMax: allFacets.priceMax,
      });
      setInitialized(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialized) return;
    setLoading(true);
    fetchProducts({
      category: filters.categories.join(','),
      size: filters.sizes.join(','),
      color: filters.colors.join(','),
      style: filters.styles.join(','),
      material: filters.materials.join(','),
      occasion: filters.occasions.join(','),
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      sort,
      page,
      limit: PAGE_SIZE,
    })
      .then((data) => {
        setProducts(data.products);
        setTotal(data.total);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [filters, sort, page, initialized]);

  function handleFiltersChange(next) {
    setFilters(next);
    setPage(1);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm font-medium text-gray-800"
        >
          <HugeiconsIcon icon={PreferenceHorizontalIcon} size={18} strokeWidth={1.5} />
          All Filters
        </button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{total} items</span>
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </div>

      <AppliedFilterPills filters={filters} categories={categories} facets={facets} onChange={handleFiltersChange} />

      {loading && <p className="text-center text-gray-400 text-sm py-10">Loading...</p>}
      {!loading && products.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-10">No products match these filters.</p>
      )}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} className="w-full" />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <FilterDrawer
        open={isFilterOpen}
        onClose={() => setFilterOpen(false)}
        facets={facets}
        categories={categories}
        appliedFilters={filters}
        onApply={handleFiltersChange}
      />
    </div>
  );
}
