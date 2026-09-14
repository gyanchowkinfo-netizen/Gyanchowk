'use client';

import { FormEvent, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';
import { FadeIn } from '@/components/motion';

export default function DoubtDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [busy, setBusy] = useState(false);
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['doubt', id],
    queryFn: () =>
      api<{
        doubt: { title: string; body: string; status: string };
        messages: Array<{ _id: string; body: string; role: string; createdAt?: string }>;
      }>(`/api/doubts/${id}`),
  });

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      await api(`/api/doubts/${id}/messages`, { method: 'POST', body: JSON.stringify({ body: form.get('body') }) });
      e.currentTarget.reset();
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send');
    } finally {
      setBusy(false);
    }
  }

  async function close() {
    try {
      await api(`/api/doubts/${id}/status`, { method: 'POST', body: JSON.stringify({ status: 'closed' }) });
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not close');
    }
  }

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;
  const d = data!.doubt;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-gc-black">{d.title}</h1>
          <p className="mt-2 text-sm text-gc-mist">{d.body}</p>
        </div>
        <StatusBadge status={d.status} />
      </div>
      <ul className="space-y-3">
        {(data?.messages ?? []).map((m) => (
          <FadeIn key={m._id}>
            <li className="gc-card list-none p-4 text-sm">
              <p className="text-xs uppercase tracking-widest text-gc-gold">{m.role}</p>
              <p className="mt-2 whitespace-pre-wrap">{m.body}</p>
            </li>
          </FadeIn>
        ))}
      </ul>
      {d.status !== 'closed' ? (
        <form onSubmit={send} className="gc-card space-y-3 p-5">
          <Textarea name="body" label="Follow up" required />
          <div className="flex gap-2">
            <Button loading={busy} type="submit">
              Send
            </Button>
            <Button type="button" variant="ghost" onClick={() => void close()}>
              Close doubt
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
