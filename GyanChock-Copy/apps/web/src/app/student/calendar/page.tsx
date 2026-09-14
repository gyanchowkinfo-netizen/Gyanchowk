'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Select } from '@/components/ui/Input';

export default function CalendarPage() {
  const [view, setView] = useState<'month' | 'list'>('list');
  const range = useMemo(() => {
    const from = new Date();
    from.setDate(1);
    const to = new Date(from.getFullYear(), from.getMonth() + 1, 0);
    return { from: from.toISOString(), to: to.toISOString() };
  }, []);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['calendar', range.from],
    queryFn: () =>
      api<{ items: Array<{ _id: string; title: string; type?: string; startsAt?: string }> }>(
        `/api/learning/calendar?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`,
      ),
  });
  const items = data?.items ?? [];
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl text-gc-black">Calendar</h1>
        <Select value={view} onChange={(e) => setView(e.target.value as 'month' | 'list')} className="max-w-[160px]">
          <option value="list">List</option>
          <option value="month">Month</option>
        </Select>
      </div>
      <p className="mt-2 text-sm text-gc-mute">Tests, assignments, mentorship reviews and expiry reminders for this month.</p>
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      {!isLoading && !items.length ? <EmptyState title="Nothing scheduled this month" /> : null}
      {view === 'list' ? (
        <ul className="mt-6 space-y-2">
          {items.map((ev) => (
            <li key={ev._id} className="gc-card flex justify-between p-4 text-sm">
              <span>{ev.title}</span>
              <span className="text-gc-mute">
                {ev.type} · {ev.startsAt ? new Date(ev.startsAt).toLocaleString() : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((ev) => (
            <article key={ev._id} className="gc-card p-4 text-sm">
              <p className="text-gc-gold">{ev.startsAt ? new Date(ev.startsAt).toLocaleDateString() : '—'}</p>
              <p className="mt-1">{ev.title}</p>
              <p className="text-xs text-gc-mute">{ev.type}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
