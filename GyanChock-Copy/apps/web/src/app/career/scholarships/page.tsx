'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer, PageHeader, Breadcrumbs } from '@/components/layout/Page';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { formatDate } from '@/lib/format';

type Scholarship = { _id: string; title: string; eligibility?: string; amount?: string; deadline?: string; applyUrl?: string };

export default function ScholarshipsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['scholarships'],
    queryFn: () => api<{ items: Scholarship[] }>('/api/career/scholarships'),
  });
  return (
    <PageContainer>
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/career', label: 'Career' }, { label: 'Scholarships' }]} />
      <PageHeader title="Scholarships" subtitle="Eligibility, amounts, and official apply links published by the career desk." />
      {isLoading ? <LoadingState /> : null}
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {(data?.items ?? []).map((s) => (
          <li key={s._id} className="gc-card p-5">
            <h2 className="font-display text-xl">{s.title}</h2>
            {s.amount ? <p className="mt-1 text-gc-gold">{s.amount}</p> : null}
            <p className="mt-2 text-sm text-gc-mist">{s.eligibility}</p>
            <p className="mt-2 text-xs text-gc-mute">Deadline {formatDate(s.deadline) ?? '—'}</p>
            {s.applyUrl ? (
              <a className="gc-btn-primary mt-4 inline-flex" href={s.applyUrl} target="_blank" rel="noreferrer">
                Apply
              </a>
            ) : null}
          </li>
        ))}
      </ul>
      {!isLoading && !(data?.items.length) ? <EmptyState title="No scholarships published yet" /> : null}
    </PageContainer>
  );
}
