'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, LoadingState } from '@/components/ui/States';
import Link from 'next/link';

export default function StudentResultsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['results'],
    queryFn: () =>
      api<{ items: Array<{ _id: string; percentage?: number; score?: number; test?: string; rankAllIndia?: number }> }>(
        '/api/tests/results',
      ),
  });
  return (
    <div>
      <h1 className="font-display text-3xl text-gc-black">Results</h1>
      {isLoading ? <LoadingState /> : null}
      <ul className="mt-6 space-y-3">
        {(data?.items ?? []).map((r) => (
          <li key={r._id}>
            <Link href={`/student/results/${r._id}`} className="gc-card block p-4 hover:border-gc-gold">
              Score {r.score} · {r.percentage}% · AIR {r.rankAllIndia ?? '—'}
            </Link>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No results yet" action={{ href: '/student/tests', label: 'Take a test' }} /> : null}
    </div>
  );
}
