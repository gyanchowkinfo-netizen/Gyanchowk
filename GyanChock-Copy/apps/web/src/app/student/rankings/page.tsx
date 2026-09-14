'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { StatusBadge } from '@/components/ui/Badge';
import { StaggerContainer, StaggerItem } from '@/components/motion';

export default function RankingsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ranks-me'],
    queryFn: () =>
      api<{
        items: Array<{ _id?: string; scope: string; rank: number; percentile?: number; test?: { title?: string } }>;
      }>('/api/rankings/me'),
  });
  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Rankings</h1>
      <p className="mt-2 text-sm text-gc-mute">AIR, state and batch ranks are computed after you submit a test — never in the browser.</p>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <StaggerContainer className="mt-6 space-y-3">
        {(data?.items ?? []).map((r, i) => (
          <StaggerItem key={r._id ?? i}>
            <article className="gc-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-display">
                  {r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] + ' ' : ''}
                  {r.test?.title ?? r.scope}
                </p>
                <p className="text-sm text-gc-mute">Scope: {r.scope}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl text-gc-black">#{r.rank}</p>
                {r.percentile != null ? <StatusBadge status={`p${r.percentile}`} /> : null}
              </div>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No ranks yet" body="Submit a published test to appear on the leaderboard." /> : null}
    </div>
  );
}
