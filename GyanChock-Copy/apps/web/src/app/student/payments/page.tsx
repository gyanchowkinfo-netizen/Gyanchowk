'use client';

import { EntityList } from '@/components/ui/EntityList';

export default function StudentPaymentsPage() {
  return <EntityList title="Payment history" path="/api/payments/history" empty="No payments yet" />;
}
