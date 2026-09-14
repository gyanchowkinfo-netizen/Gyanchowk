'use client';

import { FormEvent, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';
import { StaggerContainer, StaggerItem } from '@/components/motion';

interface Mentorship {
  _id: string;
  mentor?: { name?: string; headline?: string };
  student?: { name?: string };
  goals?: Array<{ title: string; done?: boolean }>;
  meetings?: Array<{ startsAt?: string; agenda?: string; status?: string }>;
  messages?: Array<{ body: string; createdAt?: string }>;
  notes?: string;
}

export default function MentorshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['mentorship', id],
    queryFn: () => api<{ mentorship: Mentorship }>(`/api/mentorship/${id}`),
  });
  const [busy, setBusy] = useState(false);
  const m = data?.mentorship;

  async function addGoal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      await api(`/api/mentorship/${id}/goals`, { method: 'POST', body: JSON.stringify({ title: form.get('title') }) });
      e.currentTarget.reset();
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add goal');
    } finally {
      setBusy(false);
    }
  }

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      await api(`/api/mentorship/${id}/message`, { method: 'POST', body: JSON.stringify({ body: form.get('body') }) });
      e.currentTarget.reset();
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send');
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;
  if (!m) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gc-black">{m.mentor?.name ?? 'Mentorship'}</h1>
        <p className="text-sm text-gc-mute">{m.mentor?.headline}</p>
      </div>
      <section className="gc-card p-5">
        <h2 className="text-gc-gold">Goals</h2>
        <StaggerContainer className="mt-3 space-y-2 text-sm">
          {(m.goals ?? []).map((g, i) => (
            <StaggerItem key={i}>
              <p>
                {g.done ? '✓' : '○'} {g.title}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
        <form onSubmit={addGoal} className="mt-4 flex gap-2">
          <Input name="title" placeholder="New goal" required className="flex-1" />
          <Button loading={busy} type="submit">
            Add
          </Button>
        </form>
      </section>
      <section className="gc-card p-5">
        <h2 className="text-gc-gold">Meetings (not live class)</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(m.meetings ?? []).map((meet, i) => (
            <li key={i}>
              {meet.startsAt ? new Date(meet.startsAt).toLocaleString() : '—'} · {meet.agenda ?? 'Review'} · {meet.status}
            </li>
          ))}
        </ul>
        {!(m.meetings ?? []).length ? <p className="mt-2 text-sm text-gc-mute">No scheduled reviews yet.</p> : null}
      </section>
      <section className="gc-card p-5">
        <h2 className="text-gc-gold">Messages</h2>
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto text-sm">
          {(m.messages ?? []).map((msg, i) => (
            <li key={i} className="rounded-lg bg-gc-ink p-3">
              {msg.body}
            </li>
          ))}
        </ul>
        <form onSubmit={send} className="mt-4 space-y-2">
          <Textarea name="body" required label="Message" />
          <Button loading={busy} type="submit">
            Send
          </Button>
        </form>
      </section>
    </div>
  );
}
