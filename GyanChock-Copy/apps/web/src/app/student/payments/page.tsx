'use client';

import { useQuery } from '@tanstack/react-query';
import { api, downloadPdf } from '@/lib/api';
import { formatPaise, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/panel/ResourceManager';

type Order = { _id: string; status?: string; payablePaise?: number; gateway?: string; createdAt?: string; receipt?: string };

export default function StudentPaymentsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['my-payments'],
    queryFn: () => api<{ items: Order[] }>('/api/payments/history'),
  });

  return (
    <div>
      <PageHeader title="Payment history" subtitle="Invoices generate after a payment is verified." />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="mt-4 space-y-3">
        {(data?.items ?? []).map((o) => (
          <li key={o._id} className="gc-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p>{o.receipt ?? o._id}</p>
              <p className="text-xs text-gc-mute">{o.gateway} · {formatDate(o.createdAt)}</p>
              <StatusBadge status={o.status ?? ''} />
            </div>
            <div className="flex items-center gap-2">
              <span>{formatPaise(o.payablePaise ?? 0)}</span>
              {o.status === 'captured' ? (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={async () => {
                    try {
                      await downloadPdf(`/api/payments/invoices/${o._id}/pdf`, `invoice-${o._id}.pdf`);
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Download failed');
                    }
                  }}
                >
                  Download invoice
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No payments yet" action={{ href: '/courses', label: 'Browse courses' }} /> : null}
    </div>
  );
}
