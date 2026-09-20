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
        { key: 'price', label: 'Price (INR)' },
        { key: 'enrolledCount', label: 'Enrolled' },
        { key: 'startDate', label: 'Starts', kind: 'date' },
      ]}
      filters={[
        {
          name: 'status',
          label: 'Status',
          options: ['upcoming', 'open', 'ongoing', 'completed'].map((v) => ({ value: v, label: v })),
        },
      ]}
      create={{
        label: 'Create batch',
        path: '/api/batches',
        fields: [
          { name: 'name', label: 'Name', required: true },
          { name: 'course', label: 'Course id', required: true },
          { name: 'price', label: 'Price (INR)', type: 'number' },
          { name: 'startDate', label: 'Start', type: 'datetime' },
          { name: 'endDate', label: 'End', type: 'datetime' },
        ],
      }}
      actions={[
        {
          label: 'Open enrollment',
          path: (row) => `/api/batches/${row._id}`,
          method: 'PATCH',
          body: () => ({ status: 'open' }),
          confirm: { title: 'Open this batch?', body: 'Students will be able to enroll.' },
        },
        {
          label: 'Archive',
          variant: 'danger',
          path: (row) => `/api/batches/${row._id}`,
          method: 'PATCH',
          body: () => ({ status: 'completed' }),
          confirm: { title: 'Mark completed?', body: 'Enrollment closes for this batch.' },
        },
      ]}
    />
  );
}
