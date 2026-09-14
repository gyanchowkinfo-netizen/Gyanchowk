'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { StatusBadge, Avatar } from '@/components/ui/Badge';

export default function MentorshipListPage() {
  const mine = useQuery({
    queryKey: ['mentorship-mine'],
    queryFn: () =>
      api<{
        items: Array<{
          _id: string;
          status?: string;
          mentor?: { name?: string; headline?: string; avatar?: { url?: string } };
        }>;
      }>('/api/mentorship/mine'),
  });
  const mentors = useQuery({
    queryKey: ['mentors'],
    queryFn: () =>
      api<{ items: Array<{ _id: string; user?: { name?: string; headline?: string; bio?: string; avatar?: { url?: string } } }> }>(
        '/api/mentorship/mentors',
      ),
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-gc-black">Mentorship</h1>
      <p className="text-sm text-gc-mute">Async goals, notes and scheduled reviews. Live classes are not offered.</p>
      {mine.isLoading ? <LoadingState /> : null}
      {mine.error ? <ErrorState message={(mine.error as Error).message} onRetry={() => void mine.refetch()} /> : null}
      <ul className="space-y-3">
        {(mine.data?.items ?? []).map((m) => (
          <li key={m._id}>
            <Link href={`/student/mentorship/${m._id}`} className="gc-card flex items-center gap-3 p-4 hover:border-gc-gold">
              <Avatar name={m.mentor?.name} src={m.mentor?.avatar?.url} />
              <div className="flex-1">
                <p>{m.mentor?.name ?? 'Mentor'}</p>
                <p className="text-xs text-gc-mute">{m.mentor?.headline}</p>
              </div>
              <StatusBadge status={m.status ?? 'active'} />
            </Link>
          </li>
        ))}
      </ul>
      {!mine.isLoading && !(mine.data?.items.length) ? (
        <EmptyState title="No mentorship assigned yet" body="Available mentors are listed below. Assignment is done by a teacher or admin." />
      ) : null}
      <h2 className="font-display text-xl text-gc-black">Available mentors</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {(mentors.data?.items ?? []).map((m) => (
          <article key={m._id} className="gc-card p-5">
            <div className="flex items-center gap-3">
              <Avatar name={m.user?.name} src={m.user?.avatar?.url} />
              <div>
                <p className="font-display">{m.user?.name}</p>
                <p className="text-xs text-gc-mute">{m.user?.headline}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gc-mist">{m.user?.bio}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
