'use client';

import { useState } from 'react';
import { uploadFile } from '../lib/api/uploads';

export default function ImageUpload({ label, value, onChange }: { label?: string; value?: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const url = await uploadFile(file, setProgress);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="flex items-center gap-3">
        {value && (
          <img src={value} alt="" className="w-16 h-16 object-cover rounded border border-gray-200" />
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
      </div>
      {uploading && (
        <div className="mt-2 w-40">
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">Uploading... {progress}%</span>
        </div>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
