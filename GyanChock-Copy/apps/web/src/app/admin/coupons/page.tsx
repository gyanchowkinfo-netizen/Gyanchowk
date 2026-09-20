'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Coupons"
      path="/api/payments/coupons"
      empty="No coupons yet"
      emptyCta="Create your first coupon"
      columns={[
        { key: 'code', label: 'Code' },
        { key: 'type', label: 'Type', kind: 'status' },
        { key: 'value', label: 'Value' },
        { key: 'usedCount', label: 'Used' },
        { key: 'active', label: 'Active', kind: 'bool' },
        { key: 'endsAt', label: 'Expires', kind: 'date' },
      ]}
      create={{
        label: 'Create coupon',
        path: '/api/payments/coupons',
        fields: [
          { name: 'code', label: 'Code', required: true },
          {
            name: 'type',
            label: 'Type',
            type: 'select',
            options: [
              { value: 'percent', label: 'Percent' },
              { value: 'flat', label: 'Flat (INR)' },
            ],
          },
          { name: 'value', label: 'Value', type: 'number', required: true },
          { name: 'minAmount', label: 'Min amount (INR)', type: 'number' },
          { name: 'usageLimit', label: 'Usage limit', type: 'number' },
        ],
      }}
      actions={[
        {
          label: 'Deactivate',
          variant: 'danger',
          path: (row) => `/api/payments/coupons/${row._id}/deactivate`,
          confirm: { title: 'Deactivate coupon?', body: 'It can no longer be applied at checkout.' },
        },
      ]}
    />
  );
}
