'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AnimatedProgress, CountUp, StaggerContainer, StaggerItem } from '@/components/motion';
import { ErrorState, LoadingState } from '@/components/ui/States';

export default function ProgressPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics'],
    queryFn: () =>
      api<{
        enrollments: number;
        videosWatched: number;
        studySeconds: number;
        avgCompletion: number;
        streak: number;
      }>('/api/learning/analytics'),
  });
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;
  const hours = Math.round((data?.studySeconds ?? 0) / 3600);
  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Progress</h1>
      <p className="mt-2 text-sm text-gc-mute">Server-side totals from your enrollments and video progress. Not simulated.</p>
      <StaggerContainer className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Enrollments', data?.enrollments ?? 0],
          ['Videos completed', data?.videosWatched ?? 0],
          ['Study hours (approx)', hours],
          ['Streak (days)', data?.streak ?? 0],
        ].map(([k, v]) => (
          <StaggerItem key={String(k)}>
            <div className="gc-card p-4">
              <p className="text-xs text-gc-mute">{k}</p>
              <p className="mt-2 font-display text-2xl">
                <CountUp value={Number(v)} />
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
      <div className="mt-8 gc-card p-5">
        <p className="text-sm">Average course completion</p>
        <div className="mt-3">
          <AnimatedProgress value={Number(data?.avgCompletion ?? 0)} />
        </div>
      </div>
    </div>
  );
}
