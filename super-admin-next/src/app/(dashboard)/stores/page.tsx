'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchStores } from '../../../lib/api/stores';

export default function StoresPage() {
  const [stores, setStores] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStores()
      .then(setStores)
      .catch((err) => setError(err?.response?.data?.message || err.message));
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Stores</h1>
        <Link href="/stores/new" className="btn-secondary bg-gray-900 text-white border-gray-900 hover:bg-gray-800">
          + New Store
        </Link>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">Failed to load stores: {error}</p>}

      <div className="bg-white rounded-lg border border-gray-100 shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {stores === null && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            )}
            {stores?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No stores yet.
                </td>
              </tr>
            )}
            {stores?.map((store) => (
              <tr key={store.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/stores/${store.id}`} className="text-gray-900 font-medium hover:underline">
                    {store.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">{store.slug}</td>
                <td className="px-4 py-3 text-gray-500">{store.owner?.email}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{store.plan}</td>
                <td className="px-4 py-3">
                  <span
                    className={`btn-action ${
                      store.status === 'active' ? 'btn-action-green' : 'btn-action-red'
                    }`}
                  >
                    {store.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
