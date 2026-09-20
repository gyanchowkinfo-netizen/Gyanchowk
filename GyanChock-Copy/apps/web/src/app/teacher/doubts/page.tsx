'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/panel/ResourceManager';

type Doubt = { _id: string; title: string; status?: string; body?: string };

export default function TeacherDoubtsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tdoubts-full'],
    queryFn: () => api<{ items: Doubt[] }>('/api/doubts'),
  });
  const [open, setOpen] = useState<string | null>(null);
  const thread = useQuery({
    enabled: Boolean(open),
    queryKey: ['doubt', open],
    queryFn: () =>
      api<{ doubt: Doubt; messages: Array<{ _id: string; body: string; role?: string }> }>(`/api/doubts/${open}`),
  });

  async function reply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!open) return;
    const form = new FormData(e.currentTarget);
    try {
      await api(`/api/doubts/${open}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: form.get('body') }),
      });
      toast.success('Reply sent');
      e.currentTarget.reset();
      await Promise.all([thread.refetch(), refetch()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <div>
      <PageHeader title="Doubts" subtitle="Reply on the thread. First teacher reply marks the doubt answered." />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="mt-4 space-y-3">
        {(data?.items ?? []).map((d) => (
          <li key={d._id} className="gc-card p-4">
            <button type="button" className="w-full text-left" onClick={() => setOpen(d._id)}>
              <p>{d.title}</p>
              <StatusBadge status={d.status ?? 'pending'} />
            </button>
            {open === d._id ? (
              <div className="mt-3 space-y-2 border-t border-gc-line pt-3">
                {(thread.data?.messages ?? []).map((m) => (
                  <p key={m._id} className="text-sm">
                    <span className="text-gc-gold">{m.role}:</span> {m.body}
                  </p>
                ))}
                <form onSubmit={reply} className="space-y-2">
                  <Textarea name="body" label="Reply" required />
                  <Button type="submit">Send reply</Button>
                </form>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No doubts assigned" /> : null}
    </div>
  );
}
