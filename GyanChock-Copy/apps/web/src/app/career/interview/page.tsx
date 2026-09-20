'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer, PageHeader, Breadcrumbs } from '@/components/layout/Page';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState, LoadingState } from '@/components/ui/States';

export default function InterviewPrepPage() {
  const tests = useQuery({
    queryKey: ['interview-tests'],
    queryFn: () =>
      api<{ items: Array<{ _id: string; title: string; category?: string; careerTrack?: string; status: string }> }>(
        '/api/tests?category=mock',
      ),
  });
  return (
    <PageContainer>
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/career', label: 'Career' }, { label: 'Interview prep' }]} />
      <PageHeader
        title="Interview preparation"
        subtitle="These mocks reuse the existing Test/Question engine. Attempt them from your student test desk."
      />
      {tests.isLoading ? <LoadingState /> : null}
      <ul className="mt-6 space-y-3">
        {(tests.data?.items ?? []).map((t) => (
          <li key={t._id} className="gc-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p>{t.title}</p>
              <p className="text-xs text-gc-mute">{t.careerTrack || t.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={t.status} />
              <Link href="/student/tests" className="gc-btn-primary">
                Attempt
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {!tests.isLoading && !(tests.data?.items.length) ? (
        <EmptyState title="No interview mocks yet" body="Teachers publish mock tests with a career track to appear here." />
      ) : null}
    </PageContainer>
  );
}
