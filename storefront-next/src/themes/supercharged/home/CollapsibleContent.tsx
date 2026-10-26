'use client';

import { useState } from 'react';

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
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{title}</h2>
      <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
        {faqItems.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-gray-900"
            >
              {item.question}
              <span className="text-gray-400">{openIndex === i ? '−' : '+'}</span>
            </button>
            {openIndex === i && <p className="pb-4 text-sm text-gray-600">{item.answer}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
