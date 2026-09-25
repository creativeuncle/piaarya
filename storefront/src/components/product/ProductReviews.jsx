import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { fetchProductReviews } from '../../api/reviews';
import { useAuth } from '../../context/AuthContext';
import ReviewCard from './ReviewCard';
import WriteReviewModal from './WriteReviewModal';

const PREVIEW_COUNT = 5;

export default function ProductReviews({ productId }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);

  function load() {
    if (!productId) return;
    setLoading(true);
    fetchProductReviews(productId, { sort: 'helpful' })
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, [productId]);

  function handleWriteReviewClick() {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/products/${productId}`);
      return;
    }
    setShowWriteReview(true);
  }

  if (loading) return null;

  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-xl font-bold text-gray-900">Hear what our customers say ({reviews.length})</h2>
        <div className="flex items-center gap-4">
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
          <button
            onClick={handleWriteReviewClick}
            className="flex items-center gap-2 border border-gray-300 text-gray-900 font-medium px-4 py-2 rounded-md text-sm hover:bg-gray-50"
          >
            <HugeiconsIcon icon={PencilEdit02Icon} size={16} strokeWidth={1.5} />
            Write a Review
          </button>
        </div>
      </div>

      {reviews.length === 0 && (
        <p className="text-sm text-gray-500">No reviews yet — be the first to review this product.</p>
      )}

      {reviews.length > 0 && (
        <>
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
        </>
      )}

      {showWriteReview && (
        <WriteReviewModal
          productId={productId}
          onClose={() => setShowWriteReview(false)}
          onSubmitted={load}
        />
      )}
    </div>
  );
}
