'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { toast } from '@/lib/toast';
import { PageHeader } from '@/components/panel/ResourceManager';

type Session = { _id: string; title: string; scheduledAt?: string; batch?: string };
type Student = { user?: { _id: string; name?: string; email?: string } };

export default function TeacherAttendancePage() {
  const sessions = useQuery({
    queryKey: ['att-sessions'],
    queryFn: () => api<{ items: Session[] }>('/api/attendance/sessions'),
  });
  const roster = useQuery({
    queryKey: ['att-roster'],
    queryFn: () => api<{ items: Student[] }>('/api/learning/roster'),
  });
  const [sessionId, setSessionId] = useState('');
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function createSession(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api('/api/attendance/sessions', {
        method: 'POST',
        body: JSON.stringify({
          title: form.get('title'),
          batch: form.get('batch'),
          scheduledAt: form.get('scheduledAt'),
        }),
      });
      toast.success('Session created');
      await sessions.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  }

  async function saveMarks() {
    if (!sessionId) return;
    setBusy(true);
    try {
      await api(`/api/attendance/sessions/${sessionId}/mark`, {
        method: 'POST',
        body: JSON.stringify({
          marks: Object.entries(marks).map(([studentId, mark]) => ({ studentId, mark })),
        }),
      });
      toast.success('Attendance saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Attendance" subtitle="Create a session then bulk-mark present, absent, late, or excused." />
      <form onSubmit={createSession} className="gc-card grid gap-3 p-5 md:grid-cols-3">
        <Input name="title" label="Title" required />
        <Input name="batch" label="Batch id" required />
        <Input name="scheduledAt" type="datetime-local" label="When" required />
        <Button type="submit">Create session</Button>
      </form>
      {sessions.isLoading ? <LoadingState /> : null}
      {sessions.error ? <ErrorState message={(sessions.error as Error).message} onRetry={() => void sessions.refetch()} /> : null}
      <Select label="Session" value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
        <option value="">Select session</option>
        {(sessions.data?.items ?? []).map((s) => (
          <option key={s._id} value={s._id}>
            {s.title}
          </option>
        ))}
      </Select>
      <ul className="space-y-2">
        {(roster.data?.items ?? []).map((row) => {
          const id = row.user?._id;
          if (!id) return null;
          return (
            <li key={id} className="gc-card flex flex-wrap items-center justify-between gap-3 p-3">
              <span>{row.user?.name}</span>
              <Select
                aria-label={`Mark ${row.user?.name}`}
                value={marks[id] ?? 'present'}
                onChange={(e) => setMarks((m) => ({ ...m, [id]: e.target.value }))}
              >
                {['present', 'absent', 'late', 'excused'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </li>
          );
        })}
      </ul>
      <Button loading={busy} type="button" disabled={!sessionId} onClick={() => void saveMarks()}>
        Save marks
      </Button>
      {!sessions.isLoading && !(sessions.data?.items.length) ? <EmptyState title="No sessions yet" /> : null}
    </div>
  );
}
