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
  const coursesQuery = useQuery({
    queryKey: ['teacher-assignments-courses'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string }> }>('/api/courses?mine=1&limit=100'),
  });

  const courseOptions = [
    { value: '', label: 'Select a course…' },
    ...(coursesQuery.data?.items ?? []).map((c) => ({
      value: c._id,
      label: `${c.title} (ID: ${c._id})`,
    })),
  ];

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
        subtitle="Create, manage, and evaluate assignments across your courses."
        path="/api/learning/assignments"
        empty="No assignments yet"
        emptyCta="Create assignment"
        columns={[
          { key: 'title', label: 'Title' },
          {
            key: 'course',
            label: 'Course',
            render: (row) => {
              const course = row.course as { _id?: string; title?: string } | undefined;
              if (course && typeof course === 'object' && course.title) {
                return (
                  <div>
                    <div className="font-semibold text-gc-ink">{course.title}</div>
                    <div className="text-[10px] text-gc-mute font-mono">ID: {course._id}</div>
                  </div>
                );
              }
              return String(row.course ?? '—');
            },
          },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'deadline', label: 'Deadline', kind: 'date' },
        ]}
        create={{
          label: 'Create assignment',
          path: '/api/learning/assignments',
          fields: [
            { name: 'title', label: 'Title', required: true },
            { name: 'course', label: 'Select Course', type: 'select', options: courseOptions, required: true },
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
            <Button
              key={a._id}
              variant={open === a._id ? 'primary' : 'outline'}
              type="button"
              onClick={() => setOpen(open === a._id ? null : a._id)}
            >
              {a.title}
            </Button>
          ))}
        </div>
        {open ? (
          <div className="mt-4 space-y-3">
            {(submissions.data?.submissions ?? []).map((s) => (
              <form
                key={s._id}
                className="gc-card flex flex-wrap items-center justify-between gap-3 p-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  await api(`/api/learning/assignments/${open}/evaluate/${s._id}`, {
                    method: 'POST',
                    body: JSON.stringify({
                      score: Number(form.get('score')),
                      feedback: form.get('feedback'),
                    }),
                  });
                  toast.success('Graded');
                  await submissions.refetch();
                }}
              >
                <div>
                  <p className="font-semibold">{s.user?.name ?? 'Student'}</p>
                  <p className="text-xs text-gc-mute">Status: {s.status}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Input name="score" label="Score" defaultValue={s.score ?? 0} type="number" />
                  <Input name="feedback" label="Feedback" placeholder="Well done…" />
                  <Button type="submit">Save score</Button>
                </div>
              </form>
            ))}
            {!submissions.isLoading && !(submissions.data?.submissions.length) ? (
              <EmptyState title="No submissions yet" />
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
