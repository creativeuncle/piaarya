'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, PauseIcon } from '@hugeicons/core-free-icons';
import { DARK_BG, DISPLAY_FONT, EYEBROW } from '../styles';

export default function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className={`${DARK_BG} py-20`}>
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <div className="relative aspect-video overflow-hidden rounded-3xl bg-gradient-to-br from-[#41473d] via-[#4d5445] to-[#646c5f]">
          <img
            src="https://picsum.photos/seed/stretch-studio/1600/900"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-[#41473d]/45" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center md:p-10">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause video' : 'Play video'}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white text-white transition-colors hover:bg-white/10"
            >
              <HugeiconsIcon icon={playing ? PauseIcon : PlayIcon} size={22} />
            </button>

            <p className={EYEBROW}>In the Studio</p>
            <h2 className={`${DISPLAY_FONT} max-w-md text-2xl leading-tight text-white md:text-3xl`}>
              See the Everyday Hoodie in motion
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
