'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Admins"
      subtitle="Create additional admin accounts. They must change password on first login."
      path="/api/admin/users?role=admin"
      empty="No admin accounts"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Status', kind: 'status' },
        { key: 'mustChangePassword', label: 'Must change password', kind: 'bool' },
      ]}
      create={{
        label: 'Create admin',
        path: '/api/admin/admins',
        success: 'Admin created',
        fields: [
          { name: 'name', label: 'Name', required: true },
          { name: 'email', label: 'Email', required: true },
          { name: 'password', label: 'Temporary password', required: true },
        ],
      }}
      actions={[
        {
          label: 'Suspend',
          variant: 'danger',
          path: (row) => `/api/admin/users/${row._id}/status`,
          body: () => ({ status: 'suspended' }),
          confirm: { title: 'Suspend this admin?', body: 'They will not be able to sign in until reactivated.' },
        },
      ]}
    />
  );
}
