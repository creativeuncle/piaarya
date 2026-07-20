import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, deleteCategory } from '../api/categories';
import { buildTree, flattenTree, LEVEL_LABELS } from '../utils/categoryTree';

export default function Categories() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchCategories()
      .then((categories) => {
        const { tree } = buildTree(categories);
        setRows(flattenTree(tree));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <Link to="/categories/new" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800">
          Add Category
        </Link>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={5}>Loading...</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td className="px-4 py-4 text-gray-400" colSpan={5}>No categories yet.</td></tr>
            )}
            {rows.map((category) => (
              <tr key={category._id}>
                <td className="px-4 py-3">
                  {category.image ? (
                    <img src={category.image} alt="" className="w-8 h-8 object-cover rounded" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded" />
                  )}
                </td>
                <td className="px-4 py-3 text-gray-900" style={{ paddingLeft: `${16 + category.depth * 24}px` }}>
                  {category.depth > 0 && <span className="text-gray-300 mr-1">└</span>}
                  {category.name}
                </td>
                <td className="px-4 py-3 text-gray-500">{LEVEL_LABELS[category.depth]}</td>
                <td className="px-4 py-3 text-gray-500">{category.slug}</td>
                <td className="px-4 py-3 space-x-3">
                  <Link to={`/categories/${category._id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                  <button onClick={() => handleDelete(category._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
