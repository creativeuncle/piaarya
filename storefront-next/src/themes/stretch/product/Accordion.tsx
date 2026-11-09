'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { DISPLAY_FONT } from '../styles';

export default function Accordion({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/15">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className={`${DISPLAY_FONT} text-lg text-white`}>{title}</span>
        <HugeiconsIcon icon={open ? ArrowUp01Icon : ArrowDown01Icon} size={18} className="text-white" />
      </button>
      {open && <div className="pb-5 text-[15px] leading-relaxed text-white/70">{children}</div>}
    </div>
  );
}
