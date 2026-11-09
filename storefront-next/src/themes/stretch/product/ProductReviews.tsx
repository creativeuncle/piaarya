'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { fetchProductReviews } from '../../../lib/api/reviews';
import { useAuth } from '../../../context/AuthContext';
import ReviewCard from './ReviewCard';
import WriteReviewModal from '../../supercharged/product/WriteReviewModal';
import { DISPLAY_FONT } from '../styles';

const PREVIEW_COUNT = 5;

export default function ProductReviews({ productId }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
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
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }
    setShowWriteReview(true);
  }

  if (loading) return null;

  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="bg-[#41473d] py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className={`${DISPLAY_FONT} text-2xl text-white`}>Hear what our customers say ({reviews.length})</h2>
          <div className="flex items-center gap-4">
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <HugeiconsIcon
                      key={i}
                      icon={StarIcon}
                      size={18}
                      className={i < Math.round(avgRating) ? 'text-white' : 'text-white/25'}
                      fill={i < Math.round(avgRating) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="text-sm text-white/70">{avgRating.toFixed(1)} out of 5</span>
              </div>
            )}
            <button
              onClick={handleWriteReviewClick}
              className="flex items-center gap-2 rounded-full border-2 border-white/30 text-white font-medium px-4 py-2 text-sm hover:border-white"
            >
              <HugeiconsIcon icon={PencilEdit02Icon} size={16} />
              Write a Review
            </button>
          </div>
        </div>

        {reviews.length === 0 && (
          <p className="text-sm text-white/50">No reviews yet — be the first to review this product.</p>
        )}

        {reviews.length > 0 && (
          <>
            <div className="space-y-6 max-w-2xl">
              {reviews.slice(0, PREVIEW_COUNT).map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>

            <Link
              href={`/products/${productId}/reviews`}
              className="inline-block mt-6 rounded-full border-2 border-white/30 text-white font-medium px-6 py-3 text-sm hover:border-white"
            >
              View All Reviews
            </Link>
          </>
        )}

        {showWriteReview && (
          <WriteReviewModal productId={productId} onClose={() => setShowWriteReview(false)} onSubmitted={load} />
        )}
      </div>
    </div>
  );
}
