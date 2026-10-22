'use client';

import { useState } from 'react';

type Props = {
  title?: string;
  question1?: string;
  answer1?: string;
  question2?: string;
  answer2?: string;
  question3?: string;
  answer3?: string;
};

const DEFAULT_ITEMS = [
  { question: 'What is your return policy?', answer: 'You can return any item within 30 days of delivery for a full refund.' },
  { question: 'How long does shipping take?', answer: 'Orders are typically delivered within 3-5 business days.' },
  { question: 'Do you offer international shipping?', answer: 'Yes, we ship to most countries. Shipping costs are calculated at checkout.' },
];

export default function CollapsibleContent({
  title = 'Frequently Asked Questions',
  question1,
  answer1,
  question2,
  answer2,
  question3,
  answer3,
}: Props) {
  const items = [
    { question: question1 || DEFAULT_ITEMS[0].question, answer: answer1 || DEFAULT_ITEMS[0].answer },
    { question: question2 || DEFAULT_ITEMS[1].question, answer: answer2 || DEFAULT_ITEMS[1].answer },
    { question: question3 || DEFAULT_ITEMS[2].question, answer: answer3 || DEFAULT_ITEMS[2].answer },
  ];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{title}</h2>
      <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
        {items.map((item, i) => (
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
