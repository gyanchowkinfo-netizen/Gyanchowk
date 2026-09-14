'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPaise } from '@/lib/format';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { StatusBadge } from '@/components/ui/Badge';

export default function WalletPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['wallet'],
    queryFn: () =>
      api<{
        wallet: { balancePaise?: number };
        transactions: { items: Array<{ _id: string; type: string; amountPaise: number; createdAt?: string; reference?: string }> };
      }>('/api/wallet'),
  });
  const items = data?.transactions?.items ?? [];
  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Wallet</h1>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <div className="mt-6 gc-card p-6">
        <p className="text-xs uppercase tracking-widest text-gc-mute">Available balance</p>
        <p className="mt-2 font-display text-4xl">{formatPaise(data?.wallet?.balancePaise ?? 0)}</p>
        <p className="mt-2 text-sm text-gc-mute">Ledger is calculated on the server. This number is not guessed in the browser.</p>
      </div>
      <h2 className="mt-8 font-display text-xl text-gc-black">Transactions</h2>
      <ul className="mt-3 space-y-2">
        {items.map((t) => (
          <li key={t._id} className="gc-card flex items-center justify-between p-4 text-sm">
            <div>
              <StatusBadge status={t.type} />
              {t.reference ? <p className="mt-1 text-gc-mute">{t.reference}</p> : null}
            </div>
            <span>{formatPaise(t.amountPaise)}</span>
          </li>
        ))}
      </ul>
      {!isLoading && !items.length ? <EmptyState title="No wallet activity yet" /> : null}
    </div>
  );
}
