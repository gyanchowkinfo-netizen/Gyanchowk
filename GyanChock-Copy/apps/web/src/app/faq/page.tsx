'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function FaqPage() {
  const { data } = useQuery({
    queryKey: ['cms'],
    queryFn: () => api<{ faqs: Array<{ _id: string; question: string; answer: string }> }>('/api/cms/public'),
  });
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-4xl text-gc-black">FAQ</h1>
      <div className="mt-8 space-y-4">
        {(data?.faqs ?? []).map((f) => (
          <details key={f._id} className="gc-card p-4">
            <summary className="cursor-pointer font-medium text-gc-gold">{f.question}</summary>
            <p className="mt-2 text-sm text-gc-mist">{f.answer}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
