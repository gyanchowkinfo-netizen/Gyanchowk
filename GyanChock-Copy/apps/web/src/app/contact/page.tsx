'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { FadeIn } from '@/components/motion';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      await api('/api/cms/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          message: form.get('message'),
        }),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    }
  }
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <FadeIn>
        <h1 className="font-display text-4xl text-gc-black">Contact</h1>
      </FadeIn>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 gc-card p-6">
        <input className="gc-input" required name="name" placeholder="Name" />
        <input className="gc-input" required type="email" name="email" placeholder="Email" />
        <textarea className="gc-input min-h-32" required name="message" placeholder="How can we help?" />
        <button className="gc-btn-gold w-full">Send</button>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {sent ? <p className="text-sm text-emerald-400">Message delivered to Gyan Chowk admins.</p> : null}
      </form>
    </main>
  );
}
