'use client';

import { useState } from 'react';
import { subscribeNewsletter } from '../../../lib/api/forms';

type Props = {
  heading?: string;
  subtext?: string;
  buttonLabel?: string;
};

export default function EmailSubscriber({
  heading = 'Join our newsletter',
  subtext = 'Be the first to know about new arrivals and exclusive offers.',
  buttonLabel = 'Subscribe',
}: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    try {
      await subscribeNewsletter(email);
      setStatus('done');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section className="max-w-2xl mx-auto px-6 py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{heading}</h2>
      <p className="text-gray-600 mb-6">{subtext}</p>

      {status === 'done' ? (
        <p className="text-sm font-medium text-green-700">Thanks for subscribing!</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 justify-center">
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full max-w-xs"
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="bg-gray-900 text-white text-sm font-medium px-5 py-2 rounded-md whitespace-nowrap disabled:opacity-50"
          >
            {status === 'submitting' ? '...' : buttonLabel}
          </button>
        </form>
      )}
      {status === 'error' && <p className="text-sm text-red-600 mt-2">Something went wrong. Try again.</p>}
    </section>
  );
}
