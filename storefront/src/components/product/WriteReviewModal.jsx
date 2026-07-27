import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, Cancel01Icon, ImageUpload01Icon } from '@hugeicons/core-free-icons';
import { useAuth } from '../../context/AuthContext';
import { fetchReviewTags, createReview } from '../../api/reviews';
import { uploadFiles } from '../../api/uploads';

export default function WriteReviewModal({ productId, onClose, onSubmitted }) {
  const { token } = useAuth();
  const [tags, setTags] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchReviewTags().then(setTags).catch(() => {});
  }, []);

  function toggleTag(tag) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function handleImageSelect(e) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const urls = await uploadFiles(files);
      setImages((prev) => [...prev, ...urls].slice(0, 6));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeImage(url) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createReview(token, { product: productId, rating, comment, images, tags: selectedTags });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6" onClick={onClose}>
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Write a Review</h3>
          <button onClick={onClose} aria-label="Close">
            <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.5} />
          </button>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Thanks! Your review has been submitted and will appear once it's approved. You can track it under{' '}
              <strong>My Reviews</strong> in your dashboard.
            </p>
            <button
              onClick={() => {
                onSubmitted?.();
                onClose();
              }}
              className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(n)}
                    aria-label={`${n} star`}
                  >
                    <HugeiconsIcon
                      icon={StarIcon}
                      size={26}
                      strokeWidth={1.5}
                      className={n <= (hoverRating || rating) ? 'text-amber-400' : 'text-gray-200'}
                      fill={n <= (hoverRating || rating) ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {tags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">What did you like? (optional)</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs border ${
                        selectedTags.includes(tag)
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Share your experience with this product..."
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Add Photos (optional)</p>
              <div className="flex flex-wrap gap-3">
                {images.map((url) => (
                  <div key={url} className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                    <img src={url} alt="Review upload" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                      aria-label="Remove photo"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} className="text-white" />
                    </button>
                  </div>
                ))}
                {images.length < 6 && (
                  <label className="w-16 h-16 rounded-md border border-dashed border-gray-300 flex items-center justify-center cursor-pointer text-gray-400">
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} disabled={uploading} />
                    <HugeiconsIcon icon={ImageUpload01Icon} size={20} strokeWidth={1.5} />
                  </label>
                )}
              </div>
              {uploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full bg-gray-900 text-white font-semibold py-3 rounded-md disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
