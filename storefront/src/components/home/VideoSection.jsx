import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayCircleIcon } from '@hugeicons/core-free-icons';

export default function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative w-full h-[80vh] min-h-[480px] bg-gray-900 overflow-hidden">
      <img
        src="https://picsum.photos/seed/brandvideo/1920/1080"
        alt="Brand video placeholder"
        className="w-full h-full object-cover opacity-70"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Crafted for Everyday Life</h2>
        {!playing && (
          <button
            onClick={() => setPlaying(true)}
            aria-label="Play brand video"
            className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
          >
            <HugeiconsIcon icon={PlayCircleIcon} size={36} strokeWidth={1.2} className="text-gray-900" />
          </button>
        )}
        {playing && <p className="text-sm text-gray-200">Video player goes here once a real asset is added.</p>}
      </div>
    </section>
  );
}
