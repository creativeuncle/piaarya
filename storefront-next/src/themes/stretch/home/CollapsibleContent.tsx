'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { BG_LIGHT_ALT, DISPLAY_FONT } from '../styles';

type FaqItem = { question: string; answer: string };

type Props = {
  title?: string;
  items?: FaqItem[];
};

const DEFAULT_ITEMS: FaqItem[] = [
  { question: 'What is your return policy?', answer: 'You can return any item within 30 days of delivery for a full refund.' },
  { question: 'How long does shipping take?', answer: 'Orders are typically delivered within 3-5 business days.' },
  { question: 'Do you offer international shipping?', answer: 'Yes, we ship to most countries. Shipping costs are calculated at checkout.' },
];

export default function CollapsibleContent({ title = 'Frequently Asked Questions', items }: Props) {
  const faqItems = items && items.length > 0 ? items : DEFAULT_ITEMS;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={`${BG_LIGHT_ALT} py-16 md:py-20`}>
      <div className="max-w-3xl mx-auto px-6">
        <h2 className={`${DISPLAY_FONT} text-3xl text-[#3A2E1D] mb-8 text-center`}>{title}</h2>
        <div className="divide-y divide-[#3A2E1D]/15 border-t border-b border-[#3A2E1D]/15">
          {faqItems.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-[#3A2E1D]"
              >
                {item.question}
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={18}
                  className={`text-[#3A2E1D]/60 transition-transform shrink-0 ml-3 ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === i && <p className="pb-4 text-sm text-[#3A2E1D]/70">{item.answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
