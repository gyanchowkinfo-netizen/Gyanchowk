'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Attendance sessions"
      path="/api/attendance/sessions"
      empty="No attendance sessions"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'scheduledAt', label: 'When', kind: 'date' },
        { key: 'batch', label: 'Batch' },
      ]}
      create={{
        label: 'Create session',
        path: '/api/attendance/sessions',
        fields: [
          { name: 'title', label: 'Title', required: true },
          { name: 'batch', label: 'Batch id', required: true },
          { name: 'scheduledAt', label: 'Scheduled at', type: 'datetime', required: true },
          { name: 'notes', label: 'Notes' },
        ],
      }}
    />
  );
}
