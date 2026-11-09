'use client';

import { useState } from 'react';
import { subscribeNewsletter } from '../../../lib/api/forms';
import { MID_BG, DISPLAY_FONT } from '../styles';

type Props = {
  heading?: string;
  subtext?: string;
  buttonLabel?: string;
};

export default function EmailSubscriber({
  heading = 'Subscribe to our Newsletter',
  subtext = 'Be the first to know about new drops, restocks, and studio stories.',
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
    <section className={`${MID_BG} py-16`}>
      <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
        <h2 className={`${DISPLAY_FONT} text-3xl text-white md:text-4xl`}>{heading}</h2>
        {subtext && <p className="mt-3 text-sm text-white/70">{subtext}</p>}

        {status === 'done' ? (
          <p className="mt-7 text-sm font-medium text-white">Thanks for subscribing!</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3 sm:mx-auto sm:max-w-md sm:flex-row">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-white/30 bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="shrink-0 rounded-full border-2 border-white px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              {status === 'submitting' ? '...' : buttonLabel}
            </button>
          </form>
        )}
        {status === 'error' && <p className="mt-2 text-sm text-red-200">Something went wrong. Try again.</p>}
      </div>
    </section>
  );
}
