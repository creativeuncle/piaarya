import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { fetchProduct } from '../api/products';
import { fetchProductReviews, fetchReviewTags } from '../api/reviews';
import ReviewCard from '../components/product/ReviewCard';

const BASE_FILTERS = [
  { key: 'helpful', label: 'Most Helpful' },
  { key: 'recent', label: 'Most Recent' },
];

export default function ProductReviews() {
  const { id } = useParams();
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
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to={`/products/${id}`} className="flex items-center gap-1 text-sm text-gray-500 mb-4">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />
        Back to {product?.name || 'Product'}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Hear what our customers say ({reviews.length})</h1>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <HugeiconsIcon
                  key={i}
                  icon={StarIcon}
                  size={18}
                  strokeWidth={1.5}
                  className={i < Math.round(avgRating) ? 'text-amber-400' : 'text-gray-200'}
                  fill={i < Math.round(avgRating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">{avgRating.toFixed(1)} out of 5</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {BASE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-4 py-2 rounded-md text-sm border ${
              activeFilter === f.key
                ? 'bg-amber-50 border-amber-400 text-gray-900 font-medium'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveFilter(tag)}
            className={`px-4 py-2 rounded-md text-sm border ${
              activeFilter === tag
                ? 'bg-amber-50 border-amber-400 text-gray-900 font-medium'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading reviews...</p>}
      {!loading && reviews.length === 0 && <p className="text-sm text-gray-500">No reviews found.</p>}

      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>
    </div>
  );
}
