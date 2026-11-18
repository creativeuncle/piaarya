'use client';

import { useState } from 'react';
import Link from 'next/link';
import { importProductsCsv, downloadImportTemplate } from '../../../../lib/api/products';

export default function ImportProducts() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ created: number; updated: number; total: number; skipped: { row: number; sku: string; reason: string }[] } | null>(null);

  async function handleImport() {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);
    try {
      const data = await importProductsCsv(file);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Import Products</h1>
        <Link href="/products" className="text-sm text-gray-500 hover:underline">
          Back to Products
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Upload a CSV file to add or update products in bulk. A product already on your store (matched by SKU) gets
        updated; a new SKU creates a new product. A category name that doesn&apos;t exist yet is created
        automatically.
      </p>

      <button
        onClick={() => downloadImportTemplate()}
        className="text-sm text-gray-900 font-medium underline mb-6"
      >
        Download CSV template
      </button>

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setResult(null);
              setError('');
            }}
            className="text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleImport}
          disabled={!file || uploading}
          className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md disabled:opacity-60"
        >
          {uploading ? 'Importing...' : 'Import'}
        </button>
      </div>

      {result && (
        <div className="mt-6 bg-white rounded-lg shadow border border-gray-100 p-6">
          <p className="text-sm text-gray-900 mb-2">
            Processed {result.total} row{result.total === 1 ? '' : 's'}: <span className="font-medium text-green-700">{result.created} created</span>,{' '}
            <span className="font-medium text-blue-700">{result.updated} updated</span>
            {result.skipped.length > 0 && (
              <>, <span className="font-medium text-red-700">{result.skipped.length} skipped</span></>
            )}
            .
          </p>

          {result.skipped.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.skipped.map((s, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{s.row}</td>
                      <td className="px-3 py-2">{s.sku || '—'}</td>
                      <td className="px-3 py-2 text-red-600">{s.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
