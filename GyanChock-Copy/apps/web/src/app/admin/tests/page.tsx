'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Tests"
      path="/api/tests"
      empty="No tests yet"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category', kind: 'status' },
        { key: 'status', label: 'Status', kind: 'status' },
        { key: 'durationMin', label: 'Minutes' },
        { key: 'startsAt', label: 'Starts', kind: 'date' },
      ]}
      filters={[
        {
          name: 'category',
          label: 'Category',
          options: ['daily', 'weekly', 'chapter', 'subject', 'mock'].map((v) => ({ value: v, label: v })),
        },
      ]}
      create={{
        label: 'Create test',
        path: '/api/tests',
        fields: [
          { name: 'title', label: 'Title', required: true },
          {
            name: 'category',
            label: 'Category',
            type: 'select',
            options: ['daily', 'weekly', 'chapter', 'subject', 'mock'].map((v) => ({ value: v, label: v })),
          },
          { name: 'durationMin', label: 'Duration (min)', type: 'number', required: true },
          { name: 'careerTrack', label: 'Career track' },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: ['draft', 'scheduled', 'live'].map((v) => ({ value: v, label: v })),
          },
        ],
        transform: (form) => ({
          title: form.get('title'),
          category: form.get('category'),
          durationMin: Number(form.get('durationMin') || 60),
          careerTrack: form.get('careerTrack'),
          status: form.get('status'),
          sections: [{ name: 'Section A', questionIds: [] }],
        }),
      }}
      actions={[
        {
          label: 'Go live',
          path: (row) => `/api/tests/${row._id}`,
          method: 'PATCH',
          body: () => ({ status: 'live' }),
          confirm: { title: 'Make this test live?', body: 'Enrolled students can start attempting.' },
        },
        {
          label: 'Archive',
          variant: 'danger',
          path: (row) => `/api/tests/${row._id}`,
          method: 'PATCH',
          body: () => ({ status: 'archived' }),
          confirm: { title: 'Archive this test?', body: 'It drops out of the student test list.' },
        },
      ]}
    />
  );
}
