'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { DISPLAY_FONT } from '../styles';

export default function Accordion({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#3A2E1D]/15">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className={`${DISPLAY_FONT} text-lg text-[#3A2E1D]`}>{title}</span>
        <HugeiconsIcon icon={open ? ArrowUp01Icon : ArrowDown01Icon} size={18} className="text-[#3A2E1D]" />
      </button>
      {open && <div className="pb-5 text-[15px] leading-relaxed text-[#3A2E1D]/70">{children}</div>}
    </div>
  );
}
