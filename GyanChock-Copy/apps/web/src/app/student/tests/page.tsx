'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { StatusBadge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { toast } from '@/lib/toast';

export default function StudentTestsPage() {
  const [pending, setPending] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tests'],
    queryFn: () =>
      api<{ items: Array<{ _id: string; title: string; durationMin: number; status: string }> }>('/api/tests'),
  });

  async function start(id: string) {
    try {
      const res = await api<{ attempt: { _id: string } }>(`/api/tests/${id}/start`, { method: 'POST' });
      window.location.href = `/student/tests/${res.attempt._id}`;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start');
      setPending(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Tests</h1>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="mt-6 space-y-3">
        {(data?.items ?? []).map((t) => (
          <li key={t._id} className="gc-card flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{t.title}</p>
              <p className="text-xs text-gc-mute">
                {t.durationMin} min · <StatusBadge status={t.status} />
              </p>
            </div>
            <Button type="button" onClick={() => setPending(t._id)}>
              Start
            </Button>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No tests published for you yet" /> : null}
      <Link href="/student/results" className="mt-6 inline-block text-gc-glow">
        View results →
      </Link>
      <ConfirmDialog
        open={Boolean(pending)}
        title="Start this test?"
        body="The timer starts on the server. Answers autosave. Submit before time runs out."
        confirmLabel="Start paper"
        onClose={() => setPending(null)}
        onConfirm={() => pending && void start(pending)}
      />
    </div>
  );
}
