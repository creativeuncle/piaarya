'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, PauseIcon } from '@hugeicons/core-free-icons';
import { BG_LIGHT, DISPLAY_FONT } from '../styles';

export default function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className={`${BG_LIGHT} py-20`}>
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <div className="relative aspect-video overflow-hidden rounded-3xl bg-gradient-to-br from-[#3A2E1D] via-[#2A2014] to-[#4A3C28]">
          <img
            src="https://picsum.photos/seed/stretch-studio/1600/900"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-[#3A2E1D]/45" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center md:p-10">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause video' : 'Play video'}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white text-white transition-colors hover:bg-white/10"
            >
              <HugeiconsIcon icon={playing ? PauseIcon : PlayIcon} size={22} />
            </button>

            {/* On the dark photo overlay, not the page background — kept white/70 (not the shared, now-dark EYEBROW token) for legibility. */}
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/70">In the Studio</p>
            <h2 className={`${DISPLAY_FONT} max-w-md text-2xl leading-tight text-white md:text-3xl`}>
              See the Everyday Hoodie in motion
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
