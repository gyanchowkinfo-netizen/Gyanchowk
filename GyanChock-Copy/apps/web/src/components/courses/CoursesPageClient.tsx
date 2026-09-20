'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CourseGrid } from '@/components/public/CourseCard';
import { PageContainer } from '@/components/layout/Page';
import { EmptyState, ErrorState, LoadingState, Pagination } from '@/components/ui/States';
import { useDebounce } from '@/lib/hooks';
import type { CourseCardData } from '@/lib/types';
import { useCompare } from '@/lib/compare';
import { ScrollProgress } from '@/components/motion';
import { CoursesHero } from './CoursesHero';
import {
  CourseCatalogSidebar,
  CourseCatalogToolbar,
  type CourseFiltersState,
} from './CourseCatalogToolbar';

const emptyFilters = (category = ''): CourseFiltersState => ({
  category,
  subject: '',
  exam: '',
  class: '',
  language: '',
  pricing: '',
  minRating: '',
  sort: 'new',
});

function CoursesExperience() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const [filters, setFilters] = useState<CourseFiltersState>(() => emptyFilters(params.get('category') ?? ''));
  const dq = useDebounce(q, 400);

  const query = useMemo(() => {
    const u = new URLSearchParams();
    if (dq) u.set('q', dq);
    Object.entries(filters).forEach(([k, v]) => v && u.set(k, v));
    u.set('page', String(page));
    u.set('limit', '12');
    return u.toString();
  }, [dq, filters, page]);

  const list = useQuery({
    queryKey: ['courses', query],
    queryFn: () => api<{ items: CourseCardData[]; total: number; pages: number }>(`/api/courses?${query}`),
  });
  const meta = useQuery({
    queryKey: ['course-meta'],
    queryFn: () =>
      api<{ categories: string[]; subjects: string[]; exams: string[]; classes: string[]; languages: string[] }>(
        '/api/courses/meta',
      ),
    staleTime: 60_000,
  });

  const compareIds = useCompare((s) => s.ids);
  const clearCompare = useCompare((s) => s.clear);

  function patchFilters(partial: Partial<CourseFiltersState>) {
    setPage(1);
    setFilters((f) => ({ ...f, ...partial }));
  }

  function clearFilters() {
    setPage(1);
    setFilters(emptyFilters());
  }

  function onHeroSearch(e: FormEvent) {
    e.preventDefault();
    document.getElementById('course-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const categories = meta.data?.categories ?? [];

  return (
    <main>
      <ScrollProgress />
      <CoursesHero
        total={list.data?.total}
        query={q}
        onQuery={(v) => {
          setPage(1);
          setQ(v);
        }}
        onSearch={onHeroSearch}
      />

      {categories.length ? (
        <PageContainer className="py-6 pt-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`gc-chip ${filters.category === c ? 'border-gc-black bg-white' : ''}`}
                onClick={() => patchFilters({ category: filters.category === c ? '' : c })}
                suppressHydrationWarning
              >
                {c}
              </button>
            ))}
          </div>
        </PageContainer>
      ) : null}

      <CourseCatalogToolbar
        query={q}
        onQuery={(v) => {
          setPage(1);
          setQ(v);
        }}
        filters={filters}
        meta={meta.data}
        drawer={drawer}
        onDrawer={setDrawer}
        onChange={patchFilters}
        onClearFilters={clearFilters}
        resultCount={list.data?.total}
      />

      <PageContainer className="pb-16 pt-8">
        {compareIds.length ? (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-gc-line bg-[color:var(--gyan-surface)] px-4 py-3 text-sm">
            <span className="text-gc-mist">{compareIds.length} selected (max 3)</span>
            <Link href="/courses/compare" className="gc-btn-primary h-9 px-4 text-xs">
              Compare
            </Link>
            <button className="gc-btn-ghost h-9 px-3 text-xs" type="button" onClick={clearCompare}>
              Clear
            </button>
          </div>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <CourseCatalogSidebar filters={filters} meta={meta.data} onChange={patchFilters} onClear={clearFilters} />
          <div>
            {list.isLoading ? <LoadingState /> : null}
            {list.error ? <ErrorState message={(list.error as Error).message} onRetry={() => void list.refetch()} /> : null}
            {!list.isLoading && !list.data?.items.length ? (
              <EmptyState title="No courses match" body="Try another search or reset your filters." />
            ) : null}
            {list.data?.items.length ? (
              <>
                <CourseGrid courses={list.data.items} compare variant="catalog" />
                <Pagination page={page} pages={list.data.pages ?? 1} onPage={setPage} />
              </>
            ) : null}
          </div>
        </div>
      </PageContainer>
    </main>
  );
}

export function CoursesPageClient() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CoursesExperience />
    </Suspense>
  );
}
