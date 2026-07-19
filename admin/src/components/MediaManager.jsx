import { useRef, useState } from 'react';
import { uploadFiles } from '../api/uploads';

function typeFor(file) {
  return file.type.startsWith('video') ? 'video' : 'image';
}

export default function MediaManager({ media, onChange }) {
  const fileInputRef = useRef(null);
  const dragIndexRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      const urls = await uploadFiles(files);
      const newItems = urls.map((url, i) => ({ url, type: typeFor(files[i]), altText: '' }));
      onChange([...media, ...newItems]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index) {
    onChange(media.filter((_, i) => i !== index));
    setActiveIndex(null);
  }

  function setAltText(index, altText) {
    onChange(media.map((m, i) => (i === index ? { ...m, altText } : m)));
  }

  function reorder(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const next = [...media];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChange(next);
  }

  function handleDropOnGrid(e) {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) handleFiles(e.dataTransfer.files);
  }

  function handleDropOnTile(e, targetIndex) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      handleFiles(e.dataTransfer.files);
      return;
    }
    if (dragIndexRef.current !== null) reorder(dragIndexRef.current, targetIndex);
    dragIndexRef.current = null;
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnGrid}
        className="flex flex-wrap gap-3"
      >
        {media.map((item, i) => (
          <div
            key={item.url}
            draggable
            onDragStart={() => {
              dragIndexRef.current = i;
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDropOnTile(e, i)}
            onClick={() => setActiveIndex(i)}
            className="w-20 h-20 rounded border border-gray-200 overflow-hidden cursor-pointer relative bg-gray-50"
          >
            {item.type === 'video' ? (
              <video src={item.url} className="w-full h-full object-cover" muted />
            ) : (
              <img src={item.url} alt={item.altText} className="w-full h-full object-cover" />
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnGrid}
          className="w-20 h-20 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 text-2xl"
        >
          +
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {uploading && <p className="text-xs text-gray-400 mt-2">Uploading...</p>}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <p className="text-xs text-gray-400 mt-2">
        First item is used as the featured image. Drag tiles to reorder, click a tile to edit alt text.
      </p>

      {activeIndex !== null && media[activeIndex] && (
        <MediaModal
          item={media[activeIndex]}
          onClose={() => setActiveIndex(null)}
          onChangeAltText={(text) => setAltText(activeIndex, text)}
          onRemove={() => removeAt(activeIndex)}
        />
      )}
    </div>
  );
}

function MediaModal({ item, onClose, onChangeAltText, onRemove }) {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 bg-gray-900 flex items-center justify-center min-h-[320px]">
          {item.type === 'video' ? (
            <video src={item.url} controls className="max-h-96 max-w-full" />
          ) : (
            <img src={item.url} alt={item.altText} className="max-h-96 max-w-full object-contain" />
          )}
        </div>
        <div className="w-64 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alt text</label>
            <textarea
              className="input"
              rows={3}
              value={item.altText}
              onChange={(e) => onChangeAltText(e.target.value)}
              placeholder="Describe this image for accessibility and SEO"
            />
          </div>
          <button type="button" onClick={onRemove} className="text-red-600 text-sm">
            Remove
          </button>
          <button type="button" onClick={onClose} className="btn-secondary w-full">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
