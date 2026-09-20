'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Assignments"
      path="/api/learning/assignments"
      empty="No assignments yet"
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
          { name: 'batch', label: 'Batch id' },
          { name: 'instructions', label: 'Instructions', type: 'textarea' },
          { name: 'deadline', label: 'Deadline', type: 'datetime' },
        ],
        transform: (form) => ({
          title: form.get('title'),
          course: form.get('course') || undefined,
          batch: form.get('batch') || undefined,
          instructions: form.get('instructions'),
          deadline: form.get('deadline') || undefined,
          status: 'published',
        }),
      }}
    />
  );
}
