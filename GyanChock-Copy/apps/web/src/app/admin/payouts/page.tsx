'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';

export default function AdminPayoutsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: () => api<{ items: Array<{ _id: string; amountPaise: number; status: string }> }>('/api/payouts'),
  });
  const [action, setAction] = useState<{ id: string; status: 'approved' | 'rejected' | 'paid' } | null>(null);
  const [busy, setBusy] = useState(false);

  async function decide() {
    if (!action) return;
    setBusy(true);
    try {
      await api(`/api/payouts/${action.id}/decision`, { method: 'POST', body: JSON.stringify({ status: action.status }) });
      toast.success(`Payout ${action.status}`);
      setAction(null);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="mb-4 font-display text-3xl text-gc-black">Teacher payouts</h1>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="space-y-3">
        {(data?.items ?? []).map((p) => (
          <li key={p._id} className="gc-card flex flex-wrap items-center justify-between gap-3 p-4">
            <span className="flex items-center gap-3">
              {formatPaise(p.amountPaise)} <StatusBadge status={p.status} />
            </span>
            <span className="flex gap-2">
              <Button type="button" onClick={() => setAction({ id: p._id, status: 'approved' })}>
                Approve
              </Button>
              <Button variant="blue" type="button" onClick={() => setAction({ id: p._id, status: 'paid' })}>
                Mark paid
              </Button>
              <Button variant="danger" type="button" onClick={() => setAction({ id: p._id, status: 'rejected' })}>
                Reject
              </Button>
            </span>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No payout requests" /> : null}
      <ConfirmDialog
        open={Boolean(action)}
        title={`${action?.status} this payout?`}
        body="Financial status is stored on the server. Marking paid also marks available earnings as paid."
        confirmLabel="Confirm"
        loading={busy}
        onClose={() => setAction(null)}
        onConfirm={() => void decide()}
      />
    </div>
  );
}
