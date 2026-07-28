import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPages, deletePage } from '../api/pages';

export default function Pages() {
  const [pages, setPages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchPages(search ? { search } : {})
      .then(setPages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this page?')) return;
    try {
      await deletePage(id);
      setPages((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Pages</h1>
        <Link to="/settings/pages/new" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800">
          + Add New
        </Link>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <input
        type="text"
        placeholder="Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input w-64 mb-4"
      />

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={5}>Loading...</td></tr>
            )}
            {!loading && pages.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={5}>No pages yet.</td></tr>
            )}
            {pages.map((page) => (
              <tr key={page._id}>
                <td className="px-4 py-3 font-medium text-gray-900">{page.title}</td>
                <td className="px-4 py-3 text-gray-500">/{page.slug}</td>
                <td className="px-4 py-3">
                  {page.isPublished ? (
                    <span className="text-green-600 text-xs font-medium">Published</span>
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">Draft</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(page.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 space-x-3">
                  <Link to={`/settings/pages/${page._id}/edit`} className="btn-action btn-action-blue">Edit</Link>
                  <button onClick={() => handleDelete(page._id)} className="btn-action btn-action-red">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
