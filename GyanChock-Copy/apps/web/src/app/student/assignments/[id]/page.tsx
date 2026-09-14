'use client';

import { FormEvent, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [busy, setBusy] = useState(false);
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () =>
      api<{
        assignment: {
          title: string;
          instructions?: string;
          deadline?: string;
          totalMarks?: number;
          allowResubmit?: boolean;
        };
        submission?: { status?: string; answers?: string; marksAwarded?: number; feedback?: string; submittedAt?: string };
      }>(`/api/learning/assignments/${id}`),
  });

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      await api(`/api/learning/assignments/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: form.get('answers') }),
      });
      toast.success('Submitted');
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;
  if (!data?.assignment) return <EmptyState title="Assignment not found" />;

  const a = data.assignment;
  const s = data.submission;
  const overdue = a.deadline ? new Date(a.deadline) < new Date() : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gc-black">{a.title}</h1>
        <p className="mt-2 text-sm text-gc-mute">
          Deadline {a.deadline ? new Date(a.deadline).toLocaleString() : '—'} · {a.totalMarks ?? '—'} marks
          {overdue ? ' · deadline passed' : ''}
        </p>
      </div>
      {a.instructions ? <article className="gc-card whitespace-pre-wrap p-5 text-sm text-gc-mist">{a.instructions}</article> : null}
      {s ? (
        <section className="gc-card space-y-2 p-5">
          <h2 className="text-gc-gold">Your submission</h2>
          <StatusBadge status={s.status ?? 'submitted'} />
          <p className="text-sm">{s.answers}</p>
          {s.marksAwarded != null ? <p>Marks: {s.marksAwarded}</p> : null}
          {s.feedback ? <p className="text-sm text-gc-mist">Feedback: {s.feedback}</p> : null}
        </section>
      ) : null}
      {(!s || a.allowResubmit) && !(!a.allowResubmit && overdue && s) ? (
        <form onSubmit={submit} className="gc-card space-y-3 p-5">
          <Textarea name="answers" label={s ? 'Resubmit answers' : 'Your answers'} required defaultValue={s?.answers} />
          <Button loading={busy} type="submit">
            {s ? 'Resubmit' : 'Submit'}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
