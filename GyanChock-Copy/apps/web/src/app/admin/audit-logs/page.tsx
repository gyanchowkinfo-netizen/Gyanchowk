'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';

export default function Page() {
  return (
    <ResourceManager
      title="Audit logs"
      path="/api/admin/audit-logs"
      empty="No audit events"
      columns={[
        { key: 'action', label: 'Action' },
        { key: 'entity', label: 'Entity' },
        { key: 'actor', label: 'Actor' },
        { key: 'createdAt', label: 'When', kind: 'date' },
      ]}
    />
  );
}
