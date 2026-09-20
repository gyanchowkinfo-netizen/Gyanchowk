'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPaise, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { PageHeader } from '@/components/panel/ResourceManager';

type Order = {
  _id: string;
  status?: string;
  payablePaise?: number;
  gateway?: string;
  receipt?: string;
  createdAt?: string;
  productType?: string;
};

export default function AdminPaymentsPage() {
  const [open, setOpen] = useState<string | null>(null);
  const list = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => api<{ items: Order[] }>('/api/payments/history?limit=50'),
  });
  const detail = useQuery({
    enabled: Boolean(open),
    queryKey: ['admin-payment', open],
    queryFn: () =>
      api<{
        order: Order;
        payment?: { invoiceNumber?: string; razorpayPaymentId?: string; stripePaymentId?: string };
        refunds?: unknown[];
      }>(`/api/payments/orders/${open}`),
  });

  return (
    <div>
      <PageHeader title="Payments" subtitle="Captured and pending orders from Razorpay and Stripe." />
      {list.isLoading ? <LoadingState /> : null}
      {list.error ? <ErrorState message={(list.error as Error).message} onRetry={() => void list.refetch()} /> : null}
      <ul className="space-y-3">
        {(list.data?.items ?? []).map((o) => (
          <li key={o._id} className="gc-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{o.receipt ?? o._id}</p>
                <p className="text-xs text-gc-mute">
                  {o.productType} · {o.gateway ?? 'razorpay'} · {formatDate(o.createdAt)}
                </p>
                <StatusBadge status={o.status ?? 'created'} />
              </div>
              <div className="text-right">
                <p className="font-display text-lg">{formatPaise(o.payablePaise ?? 0)}</p>
                <Button variant="ghost" type="button" onClick={() => setOpen(o._id)}>
                  Details
                </Button>
              </div>
            </div>
            {open === o._id ? (
              <div className="mt-3 border-t border-gc-line pt-3 text-sm text-gc-mist">
                {detail.isLoading ? <LoadingState label="Loading order…" /> : null}
                <p>Invoice {detail.data?.payment?.invoiceNumber ?? '—'}</p>
                <p>Razorpay {detail.data?.payment?.razorpayPaymentId ?? '—'}</p>
                <p>Stripe {detail.data?.payment?.stripePaymentId ?? '—'}</p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {!list.isLoading && !(list.data?.items.length) ? <EmptyState title="No payments yet" /> : null}
    </div>
  );
}
