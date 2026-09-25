import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPageBySlug } from '../api/pages';

export default function StaticPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetchPageBySlug(slug)
      .then(setPage)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!page) return;
    document.title = page.seoTitle || page.title;
    let meta = document.querySelector('meta[name="description"]');
    if (page.metaDescription) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', page.metaDescription);
    }
    return () => {
      document.title = 'Piaarya';
    };
  }, [page]);

  if (loading) return <p className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-400 text-sm">Loading...</p>;

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500">The page you're looking for doesn't exist or isn't published.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{page.title}</h1>
      <div className="rich-content text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
