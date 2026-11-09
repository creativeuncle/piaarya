'use client';

import { useState } from 'react';
import { submitContactForm } from '../../../lib/api/forms';
import { DARK_BG, DISPLAY_FONT } from '../styles';

type Props = {
  heading?: string;
  subtext?: string;
};

export default function ContactForm({
  heading = 'Get in Touch',
  subtext = "Have a question about a piece? We'd love to hear from you.",
}: Props) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    try {
      await submitContactForm(form);
      setStatus('done');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  const fieldClass =
    'w-full border-b border-white/30 bg-transparent px-1 py-3 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none';

  return (
    <section className={`${DARK_BG} py-16 md:py-20`}>
      <div className="mx-auto max-w-xl px-6">
        <h2 className={`${DISPLAY_FONT} text-3xl text-white text-center md:text-4xl`}>{heading}</h2>
        {subtext && <p className="mt-3 text-center text-sm text-white/70">{subtext}</p>}

        {status === 'done' ? (
          <p className="mt-8 text-center text-sm font-medium text-white">We'll get back to you soon.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <input
              type="text"
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className={fieldClass}
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className={fieldClass}
            />
            <textarea
              required
              placeholder="Message"
              rows={4}
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              className={fieldClass}
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="rounded-full border-2 border-white px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              {status === 'submitting' ? 'Sending...' : 'Send Message'}
            </button>
            {status === 'error' && <p className="text-sm text-red-200">Something went wrong. Try again.</p>}
          </form>
        )}
      </div>
    </section>
  );
}
