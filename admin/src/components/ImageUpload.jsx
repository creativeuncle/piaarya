import { useState } from 'react';
import { uploadFile } from '../api/uploads';

export default function ImageUpload({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadFile(file);
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
        {uploading && <span className="text-xs text-gray-400">Uploading...</span>}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
