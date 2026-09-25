import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, CheckmarkBadge01Icon, ThumbsUpIcon } from '@hugeicons/core-free-icons';

export default function ReviewCard({ review }) {
  return (
    <div className="border-b border-gray-100 pb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <HugeiconsIcon
              key={i}
              icon={StarIcon}
              size={16}
              strokeWidth={1.5}
              className={i < review.rating ? 'text-amber-400' : 'text-gray-200'}
              fill={i < review.rating ? 'currentColor' : 'none'}
            />
          ))}
        </div>
        {review.isVerifiedBuyer && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} strokeWidth={1.5} />
            Verified Buyer
          </span>
        )}
      </div>

      {review.comment && <p className="text-sm text-gray-800 mb-3">{review.comment}</p>}

      {review.images?.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.images.map((url, idx) => (
            <div key={idx} className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
              <img src={url} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">{review.customer?.name || 'Anonymous'}</p>
          <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
        {review.helpfulCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <HugeiconsIcon icon={ThumbsUpIcon} size={14} strokeWidth={1.5} />({review.helpfulCount})
          </span>
        )}
      </div>
    </div>
  );
}
