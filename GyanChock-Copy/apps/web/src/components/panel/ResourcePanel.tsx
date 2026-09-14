'use client';

import { EntityList } from '@/components/ui/EntityList';

/** Shared list surface for student/teacher/admin pages. Renders paginated API data, not raw JSON dumps. */
export function ResourcePanel({
  title,
  path,
}: {
  title: string;
  path: string;
  action?: { label: string; onClick: () => Promise<void> | void };
}) {
  return <EntityList title={title} path={path} />;
}
