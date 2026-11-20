'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  const coursesQuery = useQuery({
    queryKey: ['admin-attendance-courses'],
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
      title="Attendance sessions"
      subtitle="Schedule and track classroom attendance sessions organized by course."
      path="/api/attendance/sessions"
      empty="No attendance sessions yet"
      columns={[
        { key: 'title', label: 'Session Title' },
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
        { key: 'scheduledAt', label: 'Scheduled When', kind: 'date' },
      ]}
      create={{
        label: 'Create session',
        path: '/api/attendance/sessions',
        fields: [
          { name: 'title', label: 'Session Title', required: true },
          { name: 'course', label: 'Select Course', type: 'select', options: courseOptions, required: true },
          { name: 'scheduledAt', label: 'Scheduled at', type: 'datetime', required: true },
          { name: 'notes', label: 'Session Notes / Agenda', type: 'textarea' },
        ],
        transform: (form) => ({
          title: form.get('title'),
          course: form.get('course') || undefined,
          scheduledAt: form.get('scheduledAt'),
          notes: form.get('notes') || undefined,
        }),
      }}
    />
  );
}
