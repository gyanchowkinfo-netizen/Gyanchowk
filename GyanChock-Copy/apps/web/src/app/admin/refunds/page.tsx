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
import { PageHeader } from '@/components/panel/ResourceManager';

type PaymentRow = {
  _id: string;
  amountPaise?: number;
  status?: string;
  invoiceNumber?: string;
  user?: string;
};

export default function AdminRefundsPage() {
  const payments = useQuery({
    queryKey: ['admin-pay-for-refund'],
    queryFn: () => api<{ items: Array<{ _id: string; payablePaise?: number; status?: string; receipt?: string }> }>('/api/payments/history?limit=50'),
  });
  const refunds = useQuery({
    queryKey: ['admin-refunds'],
    queryFn: () => api<{ items: Array<{ _id: string; amountPaise?: number; status?: string; reason?: string }> }>('/api/payments/refunds'),
  });
  const [target, setTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function issue() {
    if (!target) return;
    setBusy(true);
    try {
      const detail = await api<{ payment?: { _id: string } }>(`/api/payments/orders/${target}`);
      if (!detail.payment?._id) throw new Error('No captured payment on this order');
      await api(`/api/payments/refunds/${detail.payment._id}`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Admin issued refund' }),
      });
      toast.success('Refund processed');
      setTarget(null);
      await Promise.all([payments.refetch(), refunds.refetch()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Refund failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Refunds" subtitle="Issue a refund against a captured payment. Wallet is credited on the server." />
      {payments.isLoading ? <LoadingState /> : null}
      {payments.error ? <ErrorState message={(payments.error as Error).message} onRetry={() => void payments.refetch()} /> : null}
      <ul className="space-y-3">
        {(payments.data?.items ?? [])
          .filter((o) => o.status === 'captured')
          .map((o) => (
            <li key={o._id} className="gc-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p>{o.receipt}</p>
                <StatusBadge status={o.status ?? ''} />
              </div>
              <div className="flex items-center gap-3">
                <span>{formatPaise(o.payablePaise ?? 0)}</span>
                <Button variant="danger" type="button" onClick={() => setTarget(o._id)}>
                  Issue refund
                </Button>
              </div>
            </li>
          ))}
      </ul>
      <h2 className="font-display text-xl">Processed refunds</h2>
      <ul className="space-y-2">
        {(refunds.data?.items ?? []).map((r) => (
          <li key={r._id} className="gc-card flex justify-between p-3 text-sm">
            <span>{r.reason ?? 'Refund'}</span>
            <span>
              {formatPaise(r.amountPaise ?? 0)} <StatusBadge status={r.status ?? ''} />
            </span>
          </li>
        ))}
      </ul>
      {!payments.isLoading && !(payments.data?.items ?? []).some((o) => o.status === 'captured') ? (
        <EmptyState title="No captured payments to refund" />
      ) : null}
      <ConfirmDialog
        open={Boolean(target)}
        title="Issue this refund?"
        body="The payment is reversed, teacher earnings are reversed, and the student wallet is credited. This cannot be undone from the UI."
        confirmLabel="Refund"
        loading={busy}
        onClose={() => setTarget(null)}
        onConfirm={() => void issue()}
      />
    </div>
  );
}

void 0 as unknown as PaymentRow;
