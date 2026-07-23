import { useEffect, useState } from 'react';
import { fetchFeaturedReviews } from '../../api/reviews';
import Carousel from '../Carousel';

function Stars({ rating }) {
  return <span className="text-yellow-500">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
}

export default function ReviewsSection() {
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
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">What Our Customers Say</h2>
      {loading && <p className="text-gray-400 text-sm">Loading...</p>}
      {!loading && (
        <Carousel>
          {reviews.map((review) => (
            <div key={review._id} className="shrink-0 w-80 snap-start bg-gray-50 rounded-lg p-6">
              <Stars rating={review.rating} />
              <p className="text-sm text-gray-700 mt-3">"{review.comment}"</p>
              <p className="text-xs text-gray-500 mt-4 font-medium">
                {review.customer?.name} · {review.product?.name}
              </p>
            </div>
          ))}
        </Carousel>
      )}
    </section>
  );
}
