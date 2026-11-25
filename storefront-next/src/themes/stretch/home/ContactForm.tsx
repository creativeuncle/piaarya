'use client';

import { useState } from 'react';
import { submitContactForm } from '../../../lib/api/forms';
import { BG_LIGHT, DISPLAY_FONT } from '../styles';

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
    'w-full border-b border-[#3A2E1D]/30 bg-transparent px-1 py-3 text-sm text-[#3A2E1D] placeholder:text-[#3A2E1D]/50 focus:border-[#3A2E1D] focus:outline-none';

  return (
    <section className={`${BG_LIGHT} py-16 md:py-20`}>
      <div className="mx-auto max-w-xl px-6">
        <h2 className={`${DISPLAY_FONT} text-3xl text-[#3A2E1D] text-center md:text-4xl`}>{heading}</h2>
        {subtext && <p className="mt-3 text-center text-sm text-[#3A2E1D]/70">{subtext}</p>}

        {status === 'done' ? (
          <p className="mt-8 text-center text-sm font-medium text-[#3A2E1D]">We'll get back to you soon.</p>
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
              className="rounded-full border-2 border-[#3A2E1D] px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#3A2E1D] transition-colors hover:bg-[#3A2E1D]/10 disabled:opacity-50"
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
