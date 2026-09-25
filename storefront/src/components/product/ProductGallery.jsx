import { useState } from 'react';

export default function ProductGallery({ media }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const items = media?.length ? media : [{ url: null, type: 'image', altText: 'No image available' }];
  const active = items[activeIndex];

  return (
    <div>
      <div className="bg-gray-100 aspect-square rounded-lg overflow-hidden mb-3">
        {active.url ? (
          active.type === 'video' ? (
            <video src={active.url} controls className="w-full h-full object-cover" />
          ) : (
            <img src={active.url} alt={active.altText} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {items.map((item, i) => (
            <button
              key={item.url || i}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                i === activeIndex ? 'border-gray-900' : 'border-transparent'
              }`}
            >
              {item.type === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={item.url} alt={item.altText} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
