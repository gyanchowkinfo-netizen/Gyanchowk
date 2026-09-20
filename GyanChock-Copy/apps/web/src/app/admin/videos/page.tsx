'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Videos"
      path="/api/videos"
      empty="No videos uploaded"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status', kind: 'status' },
        { key: 'isDemo', label: 'Free preview', kind: 'bool' },
        { key: 'duration', label: 'Duration' },
      ]}
      actions={[
        {
          label: 'Mark demo',
          path: (row) => `/api/videos/${row._id}`,
          method: 'PATCH',
          body: () => ({ isDemo: true }),
        },
        {
          label: 'Clear demo',
          variant: 'danger',
          path: (row) => `/api/videos/${row._id}`,
          method: 'PATCH',
          body: () => ({ isDemo: false }),
          confirm: { title: 'Remove free preview?', body: 'Only enrolled students will be able to play this video.' },
        },
      ]}
    />
  );
}
