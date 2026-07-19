import { useState } from 'react';
import { uploadFiles } from '../api/uploads';

export default function MultiUpload({ label, values, onChange, accept = 'image/*' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFileChange(e) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const urls = await uploadFiles(files);
      onChange([...(values || []), ...urls]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="flex flex-wrap gap-3 mb-2">
        {(values || []).map((url, i) => (
          <div key={i} className="relative">
            {accept.startsWith('video') ? (
              <video src={url} className="w-16 h-16 object-cover rounded border border-gray-200" />
            ) : (
              <img src={url} alt="" className="w-16 h-16 object-cover rounded border border-gray-200" />
            )}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs leading-5"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <input type="file" accept={accept} multiple onChange={handleFileChange} className="text-sm" />
      {uploading && <span className="text-xs text-gray-400 ml-2">Uploading...</span>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
