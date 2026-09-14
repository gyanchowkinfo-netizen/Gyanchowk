'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { StatusBadge } from '@/components/ui/Badge';

export default function StudentBatchesPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () =>
      api<{
        items: Array<{
          _id: string;
          batch?: { _id: string; name: string; slug: string; status?: string };
        }>;
      }>('/api/learning/enrollments'),
  });
  const batches = (data?.items ?? []).filter((e) => e.batch);
  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">My batches</h1>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="mt-6 space-y-3">
        {batches.map((e) => (
          <li key={e._id} className="gc-card flex items-center justify-between p-5">
            <div>
              <Link href={`/batches/${e.batch!.slug}`} className="font-display text-lg text-gc-gold">
                {e.batch!.name}
              </Link>
              {e.batch!.status ? <div className="mt-2"><StatusBadge status={e.batch!.status} /></div> : null}
            </div>
          </li>
        ))}
      </ul>
      {!isLoading && !batches.length ? (
        <EmptyState title="You are not in a batch yet" action={{ href: '/batches', label: 'See batches' }} />
      ) : null}
    </div>
  );
}
