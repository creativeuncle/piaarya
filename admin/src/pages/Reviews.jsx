import { useEffect, useState } from 'react';
import { fetchReviews, setReviewStatus, setReviewReply, setReviewFeatured } from '../api/reviews';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'featured', label: 'Featured' },
];

function Stars({ rating }) {
  return <span className="text-yellow-500">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
}

export default function Reviews() {
  const [activeTab, setActiveTab] = useState('all');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    const params = activeTab === 'featured' ? { featured: 'true' } : activeTab !== 'all' ? { status: activeTab } : {};
    fetchReviews(params)
      .then(setReviews)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [activeTab]);

  async function handleStatus(id, status) {
    try {
      const updated = await setReviewStatus(id, status);
      setReviews((prev) => prev.map((r) => (r._id === id ? updated : r)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleFeatured(review) {
    try {
      const updated = await setReviewFeatured(review._id, !review.isFeatured);
      setReviews((prev) => prev.map((r) => (r._id === review._id ? updated : r)));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Reviews</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-md text-sm border ${
              activeTab === tab.key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Comment</th>
              <th className="px-4 py-3">Reply</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={7}>Loading...</td></tr>
            )}
            {!loading && reviews.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={7}>No reviews found.</td></tr>
            )}
            {reviews.map((review) => (
              <tr key={review._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{review.product?.name || '—'}</td>
                <td className="px-4 py-3">{review.customer?.name || '—'}</td>
                <td className="px-4 py-3"><Stars rating={review.rating} /></td>
                <td className="px-4 py-3 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                <td className="px-4 py-3 max-w-xs truncate text-gray-500" title={review.reply}>{review.reply || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${
                    review.status === 'approved' ? 'text-green-600' : review.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {review.status}
                  </span>
                  {review.isFeatured && <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Featured</span>}
                </td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  {review.status !== 'approved' && (
                    <button onClick={() => handleStatus(review._id, 'approved')} className="text-green-600 hover:underline">Approve</button>
                  )}
                  {review.status !== 'rejected' && (
                    <button onClick={() => handleStatus(review._id, 'rejected')} className="text-red-600 hover:underline">Reject</button>
                  )}
                  <button onClick={() => setReplyTarget(review)} className="text-blue-600 hover:underline">Reply</button>
                  <button onClick={() => handleFeatured(review)} className="text-gray-600 hover:underline">
                    {review.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {replyTarget && (
        <ReplyModal
          review={replyTarget}
          onClose={() => setReplyTarget(null)}
          onSaved={(updated) => {
            setReviews((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
            setReplyTarget(null);
          }}
        />
      )}
    </div>
  );
}

function ReplyModal({ review, onClose, onSaved }) {
  const [reply, setReply] = useState(review.reply || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await setReviewReply(review._id, reply);
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Reply to Review</h2>
        <p className="text-sm text-gray-500">"{review.comment}"</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <textarea className="input" rows={4} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply..." />
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Reply'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
