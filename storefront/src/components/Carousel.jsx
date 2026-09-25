import { useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

export default function Carousel({ children }) {
  const trackRef = useRef(null);

  function scroll(direction) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * (track.clientWidth * 0.8), behavior: 'smooth' });
  }

  return (
    <div className="relative group">
      <div ref={trackRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={18} strokeWidth={1.5} />
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}
