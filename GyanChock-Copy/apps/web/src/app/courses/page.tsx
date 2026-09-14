'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CourseGrid } from '@/components/public/CourseCard';
import { PageContainer, PageHeader, Breadcrumbs } from '@/components/layout/Page';
import { Drawer } from '@/components/ui/Overlay';
import { EmptyState, ErrorState, LoadingState, Pagination } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { useDebounce } from '@/lib/hooks';
import type { CourseCardData } from '@/lib/types';
import { Suspense } from 'react';
import Link from 'next/link';
import { useCompare } from '@/lib/compare';

function CoursesInner() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const [filters, setFilters] = useState({
    category: params.get('category') ?? '',
    subject: '',
    exam: '',
    class: '',
    language: '',
    pricing: '',
    minRating: '',
    sort: 'new',
  });
  const dq = useDebounce(q, 400);
  const query = useMemo(() => {
    const u = new URLSearchParams();
    if (dq) u.set('q', dq);
    Object.entries(filters).forEach(([k, v]) => v && u.set(k === 'exam' ? 'exam' : k === 'class' ? 'class' : k, v));
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

  const chips = Object.entries(filters).filter(([, v]) => v);
  const compareIds = useCompare((s) => s.ids);
  const clearCompare = useCompare((s) => s.clear);

  const filterForm = (
    <div className="space-y-3">
      <Select label="Category" value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
        <option value="">All</option>
        {(meta.data?.categories ?? []).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>
      <Select label="Subject" value={filters.subject} onChange={(e) => setFilters((f) => ({ ...f, subject: e.target.value }))}>
        <option value="">All</option>
        {(meta.data?.subjects ?? []).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>
      <Select label="Exam" value={filters.exam} onChange={(e) => setFilters((f) => ({ ...f, exam: e.target.value }))}>
        <option value="">All</option>
        {(meta.data?.exams ?? []).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>
      <Select label="Class" value={filters.class} onChange={(e) => setFilters((f) => ({ ...f, class: e.target.value }))}>
        <option value="">All</option>
        {(meta.data?.classes ?? []).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>
      <Select label="Language" value={filters.language} onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value }))}>
        <option value="">All</option>
        {(meta.data?.languages ?? []).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </Select>
      <Select label="Price" value={filters.pricing} onChange={(e) => setFilters((f) => ({ ...f, pricing: e.target.value }))}>
        <option value="">All</option>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
      </Select>
      <Select label="Min rating" value={filters.minRating} onChange={(e) => setFilters((f) => ({ ...f, minRating: e.target.value }))}>
        <option value="">Any</option>
        <option value="4">4+</option>
        <option value="3">3+</option>
      </Select>
    </div>
  );

  return (
    <PageContainer>
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Courses' }]} />
      <PageHeader
        title="Courses"
        subtitle="Filter recorded programmes. Results are paginated from MongoDB — the browser never loads the full catalogue."
        actions={
          <Button variant="ghost" className="lg:hidden" onClick={() => setDrawer(true)}>
            Filters
          </Button>
        }
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <input className="gc-input max-w-md" placeholder="Search" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />
        <Select value={filters.sort} onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))} className="max-w-[160px]">
          <option value="new">Newest</option>
          <option value="rating">Rating</option>
          <option value="price">Price</option>
        </Select>
      </div>
      {compareIds.length ? (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gc-gold/30 px-4 py-3 text-sm">
          <span>{compareIds.length} selected for compare (max 3)</span>
          <Link href="/courses/compare" className="gc-btn-gold">
            Compare
          </Link>
          <button className="gc-btn-ghost" type="button" onClick={clearCompare}>
            Clear
          </button>
        </div>
      ) : null}
      {chips.length ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {chips.map(([k, v]) => (
            <button
              key={k}
              className="rounded-full border border-gc-gold/40 px-3 py-1 text-xs text-gc-gold"
              onClick={() => setFilters((f) => ({ ...f, [k]: '' }))}
            >
              {k}: {v} ×
            </button>
          ))}
        </div>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{filterForm}</aside>
        <div>
          {list.isLoading ? <LoadingState /> : null}
          {list.error ? <ErrorState message={(list.error as Error).message} onRetry={() => void list.refetch()} /> : null}
          {!list.isLoading && !(list.data?.items.length) ? (
            <EmptyState title="No courses match" body="Clear filters or try another search." />
          ) : null}
          <CourseGrid courses={list.data?.items ?? []} compare />
          <Pagination page={page} pages={list.data?.pages ?? 1} onPage={setPage} />
        </div>
      </div>
      <Drawer open={drawer} title="Filters" onClose={() => setDrawer(false)}>
        {filterForm}
      </Drawer>
    </PageContainer>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CoursesInner />
    </Suspense>
  );
}
