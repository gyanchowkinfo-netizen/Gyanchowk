'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Mentorship"
      path="/api/mentorship"
      empty="No mentorship requests"
      columns={[
        { key: 'topic', label: 'Topic' },
        { key: 'status', label: 'Status', kind: 'status' },
        { key: 'createdAt', label: 'Requested', kind: 'date' },
      ]}
    />
  );
}
