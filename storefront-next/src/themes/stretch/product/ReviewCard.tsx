'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, CheckmarkBadge01Icon, ThumbsUpIcon, Cancel01Icon } from '@hugeicons/core-free-icons';

export default function ReviewCard({ review }) {
  const [lightboxUrl, setLightboxUrl] = useState(null);

  return (
    <div className="border-b border-white/15 pb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <HugeiconsIcon
              key={i}
              icon={StarIcon}
              size={16}
              className={i < review.rating ? 'text-white' : 'text-white/25'}
              fill={i < review.rating ? 'currentColor' : 'none'}
            />
          ))}
        </div>
        {review.isVerifiedBuyer && (
          <span className="flex items-center gap-1 text-xs font-medium text-white bg-white/10 px-2 py-0.5 rounded-full">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} />
            Verified Buyer
          </span>
        )}
      </div>

      {review.comment && <p className="text-sm text-white/80 mb-3">{review.comment}</p>}

      {review.images?.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.images.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setLightboxUrl(url)}
              className="w-16 h-16 rounded-md overflow-hidden bg-white/10 shrink-0 cursor-zoom-in"
            >
              <img src={url} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            title="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={28} />
          </button>
          <img
            src={lightboxUrl}
            alt="Review photo"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full rounded-lg object-contain cursor-default"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">{review.customer?.name || 'Anonymous'}</p>
          <p className="text-xs text-white/40">{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
        {review.helpfulCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-white/50">
            <HugeiconsIcon icon={ThumbsUpIcon} size={14} />({review.helpfulCount})
          </span>
        )}
      </div>
    </div>
  );
}
