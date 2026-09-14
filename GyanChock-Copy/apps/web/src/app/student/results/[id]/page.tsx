'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { AnimatedProgress, ConfettiBurst, CountUp, ProgressCircle, ScaleIn, StaggerContainer, StaggerItem } from '@/components/motion';

export default function ResultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['result', id],
    queryFn: () =>
      api<{
        result: {
          score: number;
          maxScore: number;
          percentage: number;
          accuracy: number;
          attempted: number;
          correct: number;
          incorrect: number;
          skipped: number;
          timeTakenSec: number;
          rankAllIndia?: number;
          rankState?: number;
          rankBatch?: number;
          percentile?: number;
          subjectBreakdown?: Record<string, { score: number; correct: number; total: number }>;
        };
        test?: { title?: string };
      }>(`/api/tests/results/${id}`),
  });
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;
  const r = data!.result;
  const celebrate = r.percentage >= 80;
  return (
    <div className="relative space-y-6">
      <ConfettiBurst active={celebrate} />
      <h1 className="font-display text-3xl text-gc-black">{data?.test?.title ?? 'Result'}</h1>
      <div className="flex flex-wrap items-center gap-6">
        <ScaleIn>
          <ProgressCircle value={r.percentage} />
        </ScaleIn>
        <p className="font-display text-4xl text-gc-black">
          <CountUp value={r.percentage} suffix="%" />
        </p>
      </div>
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Score', r.score],
          ['Max', r.maxScore],
          ['Accuracy', r.accuracy],
          ['AIR', r.rankAllIndia ?? 0],
        ].map(([k, v]) => (
          <StaggerItem key={String(k)}>
            <div className="gc-card p-4">
              <p className="text-xs text-gc-mute">{k}</p>
              <p className="font-display text-2xl">
                <CountUp value={Number(v)} />
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
      <p className="text-sm text-gc-mute">
        Attempted {r.attempted} · Correct {r.correct} · Incorrect {r.incorrect} · Skipped {r.skipped} · Time {Math.round((r.timeTakenSec ?? 0) / 60)} min
        · State rank {r.rankState ?? '—'} · Batch rank {r.rankBatch ?? '—'} · Percentile {r.percentile ?? '—'}
      </p>
      <div>
        <p className="mb-2 text-sm">Overall</p>
        <AnimatedProgress value={r.percentage} />
      </div>
      <h2 className="font-display text-xl text-gc-black">Subject performance</h2>
      <ul className="space-y-2 text-sm">
        {Object.entries(r.subjectBreakdown ?? {}).map(([k, v]) => (
          <li key={k} className="gc-card p-3">
            {k}: {v.correct}/{v.total} (score {v.score})
          </li>
        ))}
      </ul>
    </div>
  );
}
