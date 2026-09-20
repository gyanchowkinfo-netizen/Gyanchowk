'use client';

import { ResourceManager } from '@/components/panel/ResourceManager';
import { formatPaise } from '@/lib/format';

export default function Page() {
  return (
    <ResourceManager
      title="Referrals"
      path="/api/referrals/all"
      empty="No referrals yet"
      columns={[
        { key: 'referrer', label: 'Referrer' },
        { key: 'referee', label: 'Referee' },
        { key: 'status', label: 'Status', kind: 'status' },
        { key: 'rewardPaise', label: 'Reward', render: (row) => formatPaise(Number(row.rewardPaise ?? 0)) },
      ]}
    />
  );
}
