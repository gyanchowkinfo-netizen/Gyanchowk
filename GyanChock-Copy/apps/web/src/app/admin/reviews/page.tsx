'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Reviews"
      path="/api/reviews"
      empty="No reviews yet"
      columns={[
        { key: 'course', label: 'Course' },
        { key: 'user', label: 'Student' },
        { key: 'rating', label: 'Rating' },
        { key: 'body', label: 'Review' },
        { key: 'hidden', label: 'Hidden', kind: 'bool' },
        { key: 'reported', label: 'Reported', kind: 'bool' },
      ]}
      filters={[{ name: 'reported', label: 'Reported', options: [{ value: '1', label: 'Reported only' }] }]}
      actions={[
        {
          label: 'Hide',
          variant: 'danger',
          path: (row) => `/api/reviews/${row._id}`,
          method: 'DELETE',
          confirm: { title: 'Hide this review?', body: 'It is removed from the public course page.' },
        },
      ]}
    />
  );
}
