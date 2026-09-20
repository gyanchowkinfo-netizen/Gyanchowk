'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Offers"
      path="/api/payments/offers"
      empty="No offers yet"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'active', label: 'Active', kind: 'bool' },
        { key: 'startsAt', label: 'Starts', kind: 'date' },
        { key: 'endsAt', label: 'Ends', kind: 'date' },
      ]}
      create={{
        label: 'Create offer',
        path: '/api/payments/offers',
        fields: [
          { name: 'title', label: 'Title', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'startsAt', label: 'Starts', type: 'datetime' },
          { name: 'endsAt', label: 'Ends', type: 'datetime' },
        ],
      }}
      actions={[
        {
          label: 'Deactivate',
          variant: 'danger',
          path: (row) => `/api/payments/offers/${row._id}`,
          method: 'PATCH',
          body: () => ({ active: false }),
          confirm: { title: 'Turn off this offer?', body: 'It disappears from the public offers strip.' },
        },
      ]}
    />
  );
}
