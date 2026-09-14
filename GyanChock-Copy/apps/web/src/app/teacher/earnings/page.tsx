'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/format';
import { ErrorState, LoadingState, EmptyState } from '@/components/ui/States';
import { StatusBadge } from '@/components/ui/Badge';

export default function TeacherEarningsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tearn'],
    queryFn: () =>
      api<{
        items: Array<{ _id: string; netPaise: number; status: string; createdAt?: string }>;
        summary: Array<{ _id: string; total: number }>;
        commissionPercent: number;
      }>('/api/payouts/earnings'),
  });
  const summary = Object.fromEntries((data?.summary ?? []).map((s) => [s._id, s.total]));
  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Earnings</h1>
      <p className="mt-2 text-sm text-gc-mute">
        Platform commission {data?.commissionPercent ?? '—'}%. Totals come from the teacher earnings ledger.
      </p>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {['available', 'pending', 'paid'].map((k) => (
          <div key={k} className="gc-card p-4">
            <p className="text-xs capitalize text-gc-mute">{k}</p>
            <p className="mt-2 font-display text-2xl">{formatPaise(Number(summary[k] ?? 0))}</p>
          </div>
        ))}
      </div>
      <ul className="mt-6 space-y-2">
        {(data?.items ?? []).map((i) => (
          <li key={i._id} className="gc-card flex justify-between p-4 text-sm">
            <StatusBadge status={i.status} />
            <span>{formatPaise(i.netPaise)}</span>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No earnings yet" body="Revenue posts after verified student payments." /> : null}
    </div>
  );
}
