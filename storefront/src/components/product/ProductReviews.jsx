import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon } from '@hugeicons/core-free-icons';
import { fetchProductReviews } from '../../api/reviews';
import ReviewCard from './ReviewCard';

const PREVIEW_COUNT = 5;

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    fetchProductReviews(productId, { sort: 'helpful' })
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading || reviews.length === 0) return null;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Hear what our customers say ({reviews.length})</h2>
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
      </div>

      <div className="space-y-6 max-w-2xl">
        {reviews.slice(0, PREVIEW_COUNT).map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>

      <Link
        to={`/products/${productId}/reviews`}
        className="inline-block mt-6 border border-gray-300 text-gray-900 font-medium px-6 py-3 rounded-md text-sm hover:bg-gray-50"
      >
        View All Reviews
      </Link>
    </div>
  );
}
