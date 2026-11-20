'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  const coursesQuery = useQuery({
    queryKey: ['admin-assignments-courses'],
    queryFn: () => api<{ items: Array<{ _id: string; title: string }> }>('/api/courses?limit=200'),
  });

  const courseOptions = [
    { value: '', label: 'Select a course…' },
    ...(coursesQuery.data?.items ?? []).map((c) => ({
      value: c._id,
      label: `${c.title} (ID: ${c._id})`,
    })),
  ];

  return (
    <ResourceManager
      title="Assignments"
      subtitle="Create and manage student assignments organized by course."
      path="/api/learning/assignments"
      empty="No assignments yet"
      columns={[
        { key: 'title', label: 'Assignment Title' },
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
          { name: 'instructions', label: 'Instructions & Guidelines', type: 'textarea' },
          { name: 'deadline', label: 'Submission Deadline', type: 'datetime' },
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
  );
}
