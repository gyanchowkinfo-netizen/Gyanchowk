'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Doubts"
      path="/api/doubts"
      empty="No doubts yet"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status', kind: 'status' },
        { key: 'createdAt', label: 'Opened', kind: 'date' },
      ]}
      actions={[
        {
          label: 'Mark answered',
          path: (row) => `/api/doubts/${row._id}/messages`,
          body: () => ({ body: 'Marked resolved by admin.' }),
          confirm: { title: 'Close this doubt?', body: 'A resolution note is posted on the thread.' },
        },
      ]}
    />
  );
}
