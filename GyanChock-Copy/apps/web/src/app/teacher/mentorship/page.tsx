'use client';

import { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/panel/ResourceManager';

type Item = { _id: string; student?: { name?: string; email?: string }; status?: string };

export default function TeacherMentorshipPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['t-mentorship'],
    queryFn: () => api<{ items: Item[] }>('/api/mentorship'),
  });

  async function log(e: FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api(`/api/mentorship/${id}/message`, {
        method: 'POST',
        body: JSON.stringify({ body: form.get('body') }),
      });
      toast.success('Note logged');
      e.currentTarget.reset();
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <div>
      <PageHeader title="Mentorship" subtitle="Log notes on your active mentorships." />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={(error as Error).message} onRetry={() => void refetch()} /> : null}
      <ul className="mt-4 space-y-3">
        {(data?.items ?? []).map((m) => (
          <li key={m._id} className="gc-card p-4">
            <p>{m.student?.name} · {m.student?.email}</p>
            <form className="mt-3 space-y-2" onSubmit={(e) => void log(e, m._id)}>
              <Textarea name="body" label="Session note" required />
              <Button type="submit">Log note</Button>
            </form>
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No mentorships yet" /> : null}
    </div>
  );
}
