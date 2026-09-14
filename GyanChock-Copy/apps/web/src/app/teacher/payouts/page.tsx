'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';

export default function TeacherPayoutsPage() {
  const [busy, setBusy] = useState(false);
  const list = useQuery({
    queryKey: ['payouts'],
    queryFn: () => api<{ items: Array<{ _id: string; amountPaise: number; status: string; createdAt?: string }> }>('/api/payouts'),
  });

  async function requestPayout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      await api('/api/payouts/request', {
        method: 'POST',
        body: JSON.stringify({ amountPaise: Math.round(Number(form.get('amount')) * 100), note: form.get('note') }),
      });
      toast.success('Payout requested');
      e.currentTarget.reset();
      await list.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-gc-black">Payouts</h1>
      <p className="text-sm text-gc-mute">Amount cannot exceed available earnings minus pending requests — checked on the server.</p>
      <form onSubmit={requestPayout} className="gc-card flex flex-wrap items-end gap-3 p-5">
        <Input name="amount" type="number" min={1} label="Amount (INR)" required className="max-w-xs" />
        <Input name="note" label="Note" className="max-w-sm" />
        <Button loading={busy} type="submit">
          Request payout
        </Button>
      </form>
      {list.isLoading ? <LoadingState /> : null}
      {list.error ? <ErrorState message={(list.error as Error).message} onRetry={() => void list.refetch()} /> : null}
      <ul className="space-y-2">
        {(list.data?.items ?? []).map((p) => (
          <li key={p._id} className="gc-card flex justify-between p-4 text-sm">
            <StatusBadge status={p.status} />
            <span>{formatPaise(p.amountPaise)}</span>
          </li>
        ))}
      </ul>
      {!list.isLoading && !(list.data?.items.length) ? <EmptyState title="No payout requests" /> : null}
    </div>
  );
}
