'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { fetchProduct } from '../../lib/api/products';
import { fetchProductReviews, fetchReviewTags } from '../../lib/api/reviews';
import ReviewCard from './product/ReviewCard';
import { DISPLAY_FONT } from './styles';

const BASE_FILTERS = [
  { key: 'helpful', label: 'Most Helpful' },
  { key: 'recent', label: 'Most Recent' },
];

export default function ProductReviewsPage({ id }: { id: string }) {
  const [product, setProduct] = useState(null);
  const [tags, setTags] = useState([]);
  const [activeFilter, setActiveFilter] = useState('helpful');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct(id).then(setProduct).catch(() => {});
    fetchReviewTags().then(setTags).catch(() => {});
  }, [id]);

  useEffect(() => {
    setLoading(true);
    const params = activeFilter === 'helpful' || activeFilter === 'recent'
      ? { sort: activeFilter }
      : { tag: activeFilter, sort: 'helpful' };

    fetchProductReviews(id, params)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, activeFilter]);

  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="bg-[#F7EFDD] min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-6">
        <Link href={`/products/${id}`} className="flex items-center gap-1 text-sm text-[#3A2E1D]/60 mb-4 hover:text-[#3A2E1D]">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Back to {product?.name || 'Product'}
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className={`${DISPLAY_FONT} text-2xl text-[#3A2E1D]`}>Hear what our customers say ({reviews.length})</h1>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <HugeiconsIcon
                    key={i}
                    icon={StarIcon}
                    size={18}
                    className={i < Math.round(avgRating) ? 'text-[#3A2E1D]' : 'text-[#3A2E1D]/25'}
                    fill={i < Math.round(avgRating) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="text-sm text-[#3A2E1D]/70">{avgRating.toFixed(1)} out of 5</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {BASE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm border ${
                activeFilter === f.key
                  ? 'bg-[#3A2E1D] border-[#3A2E1D] text-white font-medium'
                  : 'border-[#3A2E1D]/30 text-[#3A2E1D] hover:border-[#3A2E1D]'
              }`}
            >
              {f.label}
            </button>
          ))}
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-4 py-2 rounded-full text-sm border ${
                activeFilter === tag
                  ? 'bg-[#3A2E1D] border-[#3A2E1D] text-white font-medium'
                  : 'border-[#3A2E1D]/30 text-[#3A2E1D] hover:border-[#3A2E1D]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-[#3A2E1D]/50">Loading reviews...</p>}
        {!loading && reviews.length === 0 && <p className="text-sm text-[#3A2E1D]/50">No reviews found.</p>}

        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}
