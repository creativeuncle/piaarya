import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon } from '@hugeicons/core-free-icons';
import { useAuth } from '../../context/AuthContext';
import { fetchMyReviews } from '../../api/me';

const STATUS_STYLES = {
  approved: 'bg-green-600 text-white',
  rejected: 'bg-red-600 text-white',
  pending: 'bg-gray-100 text-gray-700',
};

export default function MyReviews() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews(token)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">My Reviews</h1>
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && reviews.length === 0 && (
        <p className="text-sm text-gray-500">
          You haven't written any reviews yet.{' '}
          <Link to="/products" className="underline text-gray-900">
            Browse products
          </Link>
        </p>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {review.product?.media?.[0]?.url && (
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 shrink-0">
                    <img src={review.product.media[0].url} alt={review.product?.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <Link to={`/products/${review.product?._id}`} className="text-sm font-medium text-gray-900 hover:underline">
                    {review.product?.name || 'Product'}
                  </Link>
                  <div className="flex items-center mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <HugeiconsIcon
                        key={i}
                        icon={StarIcon}
                        size={14}
                        strokeWidth={1.5}
                        className={i < review.rating ? 'text-amber-400' : 'text-gray-200'}
                        fill={i < review.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[review.status] || STATUS_STYLES.pending}`}>
                {review.status}
              </span>
            </div>

            {review.comment && <p className="text-sm text-gray-700 mb-2">{review.comment}</p>}

            {review.images?.length > 0 && (
              <div className="flex gap-2 mb-2">
                {review.images.map((url, idx) => (
                  <div key={idx} className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 shrink-0">
                    <img src={url} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {review.reply && (
              <div className="bg-gray-50 rounded-md p-3 mt-2">
                <p className="text-xs font-medium text-gray-700 mb-1">Response from Piaarya</p>
                <p className="text-xs text-gray-600">{review.reply}</p>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
