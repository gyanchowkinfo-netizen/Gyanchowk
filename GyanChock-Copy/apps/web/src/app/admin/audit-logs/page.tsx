'use client';

import { ResourcePanel } from '@/components/panel/ResourcePanel';

export default function Page() {
  return <ResourcePanel title="Audit logs" path="/api/admin/audit-logs" />;
}
