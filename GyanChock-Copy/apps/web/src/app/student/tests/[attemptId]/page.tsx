'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Overlay';
import { LoadingState, ErrorState } from '@/components/ui/States';

interface Q {
  id: string;
  stem: string;
  type: string;
  options?: Array<{ key: string; text: string }>;
  saved?: { answer?: unknown; markedForReview?: boolean };
}

export default function AttemptPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const router = useRouter();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: () =>
      api<{ questions: Q[]; attempt: { expiresAt?: string }; test: { title?: string } }>(`/api/tests/attempts/${attemptId}`),
  });
  const [idx, setIdx] = useState(0);
  const q = data?.questions[idx];
  const [left, setLeft] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  useEffect(() => {
    if (!data?.attempt.expiresAt) return;
    const t = setInterval(() => {
      const ms = new Date(data.attempt.expiresAt!).getTime() - Date.now();
      if (ms <= 0) {
        void submit();
        return;
      }
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setLeft(`${m}:${String(s).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(t);
  }, [data?.attempt.expiresAt]);

  async function save(answer: unknown, marked = false) {
    if (!q) return;
    setSaving(true);
    try {
      await api(`/api/tests/attempts/${attemptId}/answer`, {
        method: 'POST',
        body: JSON.stringify({ questionId: q.id, answer, markedForReview: marked }),
      });
      await refetch();
    } finally {
      setSaving(false);
    }
  }

  async function submit() {
    await api(`/api/tests/attempts/${attemptId}/submit`, { method: 'POST' });
    router.push('/student/results');
  }

  if (isLoading) return <LoadingState label="Loading paper…" />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;
  if (!q) return <LoadingState label="Loading paper…" />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
      <section className="gc-card p-5">
        <div className="flex justify-between text-sm text-gc-gold">
          <span>{data?.test.title}</span>
          <span>
            Time left {left || '—'} {saving ? '· Saving…' : '· Saved'}
          </span>
        </div>
        <h2 className="mt-4 text-lg">{q.stem}</h2>
        <div className="mt-4 space-y-2">
          {(q.options ?? []).map((o) => (
            <button
              key={o.key}
              className={`gc-btn-ghost w-full justify-start transition-colors duration-200 ${q.saved?.answer === o.key ? 'border-gc-gold text-gc-gold' : ''}`}
              onClick={() => void save(o.key)}
            >
              {o.key}. {o.text}
            </button>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="ghost" type="button" onClick={() => setIdx((i) => Math.max(0, i - 1))}>
            Prev
          </Button>
          <Button variant="ghost" type="button" onClick={() => setIdx((i) => Math.min((data?.questions.length ?? 1) - 1, i + 1))}>
            Next
          </Button>
          <Button variant="ghost" type="button" onClick={() => void save(q.saved?.answer, true)}>
            Mark for review
          </Button>
          <Button className="ml-auto" type="button" onClick={() => setSubmitOpen(true)}>
            Submit
          </Button>
        </div>
      </section>
      <aside className="gc-card grid grid-cols-5 gap-2 p-4 lg:sticky lg:top-24 lg:self-start">
        {(data?.questions ?? []).map((item, i) => {
          const answered = item.saved?.answer != null && item.saved.answer !== '';
          const review = item.saved?.markedForReview;
          return (
            <button
              key={item.id}
              onClick={() => setIdx(i)}
              className={`h-9 rounded-md text-xs transition-colors duration-200 ${
                i === idx ? 'bg-gc-gold text-black' : review ? 'bg-amber-500/40' : answered ? 'bg-emerald-500/30' : 'bg-gc-ink'
              }`}
              aria-label={`Question ${i + 1}${answered ? ' answered' : ''}${review ? ' marked' : ''}`}
            >
              {i + 1}
            </button>
          );
        })}
      </aside>
      <ConfirmDialog
        open={submitOpen}
        title="Submit paper?"
        body="You cannot change answers after submit. Grading and ranks run on the server."
        confirmLabel="Submit"
        onClose={() => setSubmitOpen(false)}
        onConfirm={() => void submit()}
      />
    </div>
  );
}
