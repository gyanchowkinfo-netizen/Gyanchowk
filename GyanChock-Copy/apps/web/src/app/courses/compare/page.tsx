'use client';

import { useQueries } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useCompare } from '@/lib/compare';
import { formatPrice } from '@/lib/format';
import { PageContainer, PageHeader, Breadcrumbs } from '@/components/layout/Page';
import { EmptyState, LoadingState } from '@/components/ui/States';
import type { CourseCardData } from '@/lib/types';

export default function ComparePage() {
  const ids = useCompare((s) => s.ids);
  const clear = useCompare((s) => s.clear);
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['compare', id],
      queryFn: () => api<{ course: CourseCardData & { validityDays?: number; certificateEnabled?: boolean; teachers?: Array<{ name?: string }> } }>(`/api/courses/by-id/${id}`),
    })),
  });
  const courses = results.map((r) => r.data?.course).filter(Boolean);
  const loading = results.some((r) => r.isLoading);

  if (!ids.length) {
    return (
      <PageContainer>
        <EmptyState title="Pick courses to compare" body="Use Add to compare on the catalogue. Up to three courses." action={{ href: '/courses', label: 'Browse courses' }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/courses', label: 'Courses' }, { label: 'Compare' }]} />
      <PageHeader title="Compare courses" actions={<button className="gc-btn-ghost" onClick={clear}>Clear</button>} />
      {loading ? <LoadingState /> : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr>
              <th className="p-3 text-gc-mute"> </th>
              {courses.map((c) => (
                <th key={c!._id} className="p-3">
                  <Link href={`/courses/${c!.slug}`} className="text-gc-gold">
                    {c!.title}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Price', (c: NonNullable<(typeof courses)[number]>) => formatPrice(c.price, c.discountPercent, c.pricingType)],
              ['Validity', (c: NonNullable<(typeof courses)[number]>) => (c.validityDays ? `${c.validityDays} days` : '—')],
              ['Teachers', (c: NonNullable<(typeof courses)[number]>) => (c.teachers ?? []).map((t) => t.name).filter(Boolean).join(', ') || '—'],
              ['Certificate', (c: NonNullable<(typeof courses)[number]>) => (c.certificateEnabled ? 'Yes' : '—')],
              ['Rating', (c: NonNullable<(typeof courses)[number]>) => String(c.ratingAvg ?? '—')],
              ['Category', (c: NonNullable<(typeof courses)[number]>) => c.category ?? '—'],
              ['Exam', (c: NonNullable<(typeof courses)[number]>) => c.targetExam ?? '—'],
            ].map(([label, fn]) => (
              <tr key={String(label)} className="border-t border-gc-line">
                <td className="p-3 text-gc-mute">{label as string}</td>
                {courses.map((c) => (
                  <td key={c!._id} className="p-3">
                    {(fn as (c: NonNullable<(typeof courses)[number]>) => string)(c!)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
