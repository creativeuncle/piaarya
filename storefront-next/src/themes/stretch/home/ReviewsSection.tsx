'use client';

import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon } from '@hugeicons/core-free-icons';
import { fetchFeaturedReviews } from '../../../lib/api/reviews';
import Carousel from '../../../components/Carousel';
import { DARK_BG, DISPLAY_FONT, EYEBROW } from '../styles';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <HugeiconsIcon
          key={i}
          icon={StarIcon}
          size={14}
          className={i < rating ? 'text-white' : 'text-white/25'}
          fill={i < rating ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({ title = 'What Our Customers Say' }: { title?: string }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedReviews()
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && reviews.length === 0) return null;

  return (
    <section className={`${DARK_BG} py-16 md:py-20`}>
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-10 text-center">
          <p className={EYEBROW}>Reviews</p>
          <h2 className={`${DISPLAY_FONT} mt-2 text-3xl text-white md:text-4xl`}>{title}</h2>
        </div>
        {loading && <p className="text-center text-white/50 text-sm">Loading...</p>}
        {!loading && (
          <Carousel>
            {reviews.map((review) => (
              <div key={review._id} className="shrink-0 w-80 snap-start rounded-2xl border border-white/15 bg-white/5 p-6">
                <Stars rating={review.rating} />
                <p className="mt-3 text-sm leading-relaxed text-white/80">&ldquo;{review.comment}&rdquo;</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {review.customer?.name} · {review.product?.name}
                </p>
              </div>
            ))}
          </Carousel>
        )}
      </div>
    </section>
  );
}
