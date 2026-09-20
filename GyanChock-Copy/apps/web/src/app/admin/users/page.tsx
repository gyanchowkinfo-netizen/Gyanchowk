'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Users"
      subtitle="Cross-role search. Open the student or teacher record for actions."
      path="/api/admin/users"
      empty="No users match"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role', kind: 'status' },
        { key: 'status', label: 'Status', kind: 'status' },
      ]}
      filters={[
        {
          name: 'role',
          label: 'Role',
          options: ['student', 'teacher', 'admin'].map((v) => ({ value: v, label: v })),
        },
        {
          name: 'status',
          label: 'Status',
          options: ['active', 'suspended', 'deactivated', 'pending_verification'].map((v) => ({ value: v, label: v })),
        },
      ]}
      actions={[
        {
          label: 'View',
          href: (row) => (row.role === 'teacher' ? '/admin/teachers' : row.role === 'student' ? '/admin/students' : '/admin/admins'),
        },
      ]}
    />
  );
}
