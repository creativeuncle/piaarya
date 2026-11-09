'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { PreferenceHorizontalIcon } from '@hugeicons/core-free-icons';
import { fetchProducts, fetchProductFacets } from '../../lib/api/products';
import { fetchCategories } from '../../lib/api/categories';
import Pagination from './category/Pagination';
import FilterDrawer from './category/FilterDrawer';
import AppliedFilterPills from './category/AppliedFilterPills';
import SortDropdown from './category/SortDropdown';
import ProductTile from './home/ProductTile';
import { DISPLAY_FONT, EYEBROW } from './styles';

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
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [facets, setFacets] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
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
      setSearchQuery(searchParams.get('search') || '');
      setInitialized(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialized) return;
    setSearchQuery(searchParams.get('search') || '');
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!initialized) return;
    setLoading(true);
    fetchProducts({
      search: searchQuery,
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
  }, [filters, searchQuery, sort, page, initialized]);

  function handleFiltersChange(next) {
    setFilters(next);
    setPage(1);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <section className="bg-[#646c5f] py-16 text-center md:py-20">
        <p className={EYEBROW}>Stretch</p>
        <h1 className={`${DISPLAY_FONT} mt-3 text-4xl text-white md:text-5xl`}>
          {searchQuery ? `Search results for "${searchQuery}"` : 'Shop All'}
        </h1>
        <p className="mx-auto mt-3 max-w-md px-6 text-[15px] leading-relaxed text-white/70">
          Considered essentials in durable, natural fabrics — browse the full collection.
        </p>
      </section>

      <section className="bg-[#41473d] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setFilterOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:border-white"
            >
              <HugeiconsIcon icon={PreferenceHorizontalIcon} size={16} />
              All Filters
            </button>

            <div className="flex items-center gap-5">
              <span className="text-sm text-white/60">{total} items</span>
              <SortDropdown value={sort} onChange={setSort} />
            </div>
          </div>

          <AppliedFilterPills filters={filters} categories={categories} facets={facets} onChange={handleFiltersChange} />

          {loading && <p className="text-center text-white/50 text-sm py-10">Loading...</p>}
          {!loading && products.length === 0 && (
            <p className="text-center text-white/50 text-sm py-10">No products match these filters.</p>
          )}
          {!loading && products.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductTile key={product._id} product={product} className="w-full" />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </section>

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
