'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchStore } from '../../../../lib/api/stores';

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStore(id)
      .then(setStore)
      .catch((err) => setError(err?.response?.data?.message || err.message));
  }, [id]);

  if (error) return <div className="p-6 text-red-600 text-sm">{error}</div>;
  if (!store) return <div className="p-6 text-gray-400">Loading…</div>;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{store.name}</h1>

      <div className="bg-white border border-gray-100 rounded-lg shadow divide-y divide-gray-100">
        <Row label="Slug" value={store.slug} />
        <Row label="Custom Domain" value={store.customDomain || '—'} />
        <Row label="Plan" value={store.plan} />
        <Row label="Status" value={store.status} />
        <Row label="Owner Name" value={store.owner?.name} />
        <Row label="Owner Email" value={store.owner?.email} />
        <Row label="Created" value={new Date(store.createdAt).toLocaleString()} />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}
