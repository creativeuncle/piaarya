'use client';

import { useState } from 'react';
import { submitContactForm } from '../../../lib/api/forms';

type Props = {
  heading?: string;
  subtext?: string;
};

export default function ContactForm({
  heading = 'Get in touch',
  subtext = "Have a question? We'd love to hear from you.",
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

  return (
    <section className="max-w-xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{heading}</h2>
      <p className="text-gray-600 mb-8 text-center">{subtext}</p>

      {status === 'done' ? (
        <p className="text-sm font-medium text-green-700 text-center">
          Thanks — we'll get back to you soon.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
          />
          <textarea
            required
            placeholder="Message"
            rows={4}
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-md disabled:opacity-50"
          >
            {status === 'submitting' ? 'Sending...' : 'Send Message'}
          </button>
          {status === 'error' && <p className="text-sm text-red-600">Something went wrong. Try again.</p>}
        </form>
      )}
    </section>
  );
}
