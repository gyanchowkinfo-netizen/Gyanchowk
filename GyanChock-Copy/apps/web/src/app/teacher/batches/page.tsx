'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Batches"
      path="/api/batches"
      empty="No batches yet"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status', kind: 'status' },
        { key: 'enrolledCount', label: 'Enrolled' },
        { key: 'startDate', label: 'Starts', kind: 'date' },
      ]}
      create={{
        label: 'Create batch',
        path: '/api/batches',
        fields: [
          { name: 'name', label: 'Name', required: true },
          { name: 'course', label: 'Course id', required: true },
          { name: 'price', label: 'Price (INR)', type: 'number' },
          { name: 'startDate', label: 'Start', type: 'datetime' },
        ],
      }}
      actions={[
        {
          label: 'Open',
          path: (row) => `/api/batches/${row._id}`,
          method: 'PATCH',
          body: () => ({ status: 'open' }),
          confirm: { title: 'Open enrollment?', body: 'Students can join this batch.' },
        },
      ]}
    />
  );
}
