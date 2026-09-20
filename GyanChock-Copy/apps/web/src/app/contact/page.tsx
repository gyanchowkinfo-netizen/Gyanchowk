'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { PageContainer, PageHeader, Breadcrumbs } from '@/components/layout/Page';
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
    <PageContainer className="max-w-2xl">
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Contact' }]} />
      <FadeIn>
        <PageHeader title="Contact" subtitle="Write to the Gyan Chowk team. Messages are delivered to platform admins." />
      </FadeIn>
      <form onSubmit={onSubmit} className="gc-card space-y-4 p-5 sm:p-6">
        <input className="gc-input" required name="name" placeholder="Name" suppressHydrationWarning />
        <input className="gc-input" required type="email" name="email" placeholder="Email" suppressHydrationWarning />
        <textarea className="gc-input min-h-32" required name="message" placeholder="How can we help?" suppressHydrationWarning />
        <button className="gc-btn-primary w-full" suppressHydrationWarning>Send</button>
        {error ? <p className="text-sm text-[color:var(--gyan-error)]">{error}</p> : null}
        {sent ? <p className="text-sm text-[color:var(--gyan-success)]">Message delivered to Gyan Chowk admins.</p> : null}
      </form>
    </PageContainer>
  );
}
