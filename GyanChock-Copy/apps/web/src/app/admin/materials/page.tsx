'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Materials"
      path="/api/learning/materials"
      empty="No study materials"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'type', label: 'Type', kind: 'status' },
        { key: 'status', label: 'Status', kind: 'status' },
      ]}
      actions={[
        {
          label: 'Unpublish',
          variant: 'danger',
          path: (row) => `/api/learning/materials/${row._id}`,
          method: 'PATCH',
          body: () => ({ status: 'hidden' }),
          confirm: { title: 'Hide this material?', body: 'Students will no longer see it in the library.' },
        },
        {
          label: 'Publish',
          path: (row) => `/api/learning/materials/${row._id}`,
          method: 'PATCH',
          body: () => ({ status: 'published' }),
        },
      ]}
    />
  );
}
