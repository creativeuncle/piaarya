import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { fetchProducts } from '../api/products';

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      fetchProducts({ search: trimmed, limit: 6 })
        .then((data) => setResults(data.products))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, open]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  function goToResults() {
    if (!query.trim()) return;
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    goToResults();
  }

  function handleProductClick(id) {
    navigate(`/products/${id}`);
    onClose();
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="absolute top-full left-0 right-0 bg-white text-gray-900 shadow-lg z-50">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-gray-200 pb-3">
            <HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={1.5} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 outline-none text-base"
            />
            <button type="button" onClick={onClose} aria-label="Close search">
              <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} className="text-gray-400" />
            </button>
          </form>

          {loading && <p className="text-sm text-gray-400 mt-4">Searching...</p>}

          {!loading && query.trim() && results.length === 0 && (
            <p className="text-sm text-gray-500 mt-4">No products found for "{query}".</p>
          )}

          {!loading && results.length > 0 && (
            <div className="mt-4 space-y-1">
              {results.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleProductClick(product._id)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-50 text-left"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0">
                    {product.media?.[0]?.url && (
                      <img src={product.media[0].url} alt={product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">₹{product.price}</p>
                  </div>
                </button>
              ))}

              <button
                onClick={goToResults}
                className="w-full text-center text-sm font-medium text-gray-900 underline pt-3"
              >
                View all results for "{query}"
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
