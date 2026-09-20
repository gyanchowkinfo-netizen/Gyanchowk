'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResourceManager } from '@/components/panel/ResourceManager';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { toast } from '@/lib/toast';
import { EmptyState } from '@/components/ui/States';

export default function TeacherAssignmentsPage() {
  const list = useQuery({
    queryKey: ['t-assign'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string }> }>('/api/learning/assignments'),
  });
  const [open, setOpen] = useState<string | null>(null);
  const submissions = useQuery({
    enabled: Boolean(open),
    queryKey: ['t-sub', open],
    queryFn: () =>
      api<{
        submissions: Array<{ _id: string; user?: { name?: string }; status?: string; score?: number }>;
      }>(`/api/learning/assignments/${open}`),
  });

  return (
    <div className="space-y-8">
      <ResourceManager
        title="Assignments"
        path="/api/learning/assignments"
        empty="No assignments yet"
        emptyCta="Create assignment"
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'deadline', label: 'Deadline', kind: 'date' },
        ]}
        create={{
          label: 'Create assignment',
          path: '/api/learning/assignments',
          fields: [
            { name: 'title', label: 'Title', required: true },
            { name: 'course', label: 'Course id' },
            { name: 'instructions', label: 'Instructions', type: 'textarea' },
            { name: 'deadline', label: 'Deadline', type: 'datetime' },
          ],
          transform: (form) => ({
            title: form.get('title'),
            course: form.get('course') || undefined,
            instructions: form.get('instructions'),
            deadline: form.get('deadline') || undefined,
            status: 'published',
          }),
        }}
      />
      <section>
        <h2 className="font-display text-xl">Grade submissions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(list.data?.items ?? []).map((a) => (
            <Button key={a._id} variant={open === a._id ? 'primary' : 'ghost'} type="button" onClick={() => setOpen(a._id)}>
              {a.title}
            </Button>
          ))}
        </div>
        <ul className="mt-4 space-y-3">
          {(submissions.data?.submissions ?? []).map((s) => (
            <li key={s._id} className="gc-card p-4">
              <p>{s.user?.name} · {s.status}</p>
              <form
                className="mt-2 flex flex-wrap gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  try {
                    await api(`/api/learning/assignments/${open}/evaluate/${s._id}`, {
                      method: 'POST',
                      body: JSON.stringify({ score: Number(f.get('score')), feedback: f.get('feedback') }),
                    });
                    toast.success('Graded');
                    await submissions.refetch();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Failed');
                  }
                }}
              >
                <Input name="score" type="number" label="Score" defaultValue={String(s.score ?? '')} />
                <Textarea name="feedback" label="Feedback" />
                <Button type="submit">Save grade</Button>
              </form>
            </li>
          ))}
        </ul>
        {open && !(submissions.data?.submissions?.length) ? <EmptyState title="No submissions yet" /> : null}
      </section>
    </div>
  );
}
