'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import { ScrollProgress } from '@/components/motion';
import type { BatchCardData, BatchCatalogStats, BatchFacet } from '@/lib/types';
import { BatchesHero } from './BatchesHero';
import { BatchSearch, type BatchFiltersState } from './BatchSearch';
import { FeaturedBatches } from './FeaturedBatches';
import { BatchCategories } from './BatchCategories';
import { BatchBenefits } from './BatchBenefits';
import { LearningJourney } from './LearningJourney';
import { BatchExploreGrid } from './BatchExploreGrid';
import { BatchCTA } from './BatchCTA';

const PAGE_SIZE = 9;

interface Catalog {
  items: BatchCardData[];
  total?: number;
  pages?: number;
  featured?: BatchCardData[];
  stats?: BatchCatalogStats;
  facets?: {
    exams: BatchFacet[];
    classes: BatchFacet[];
    languages: BatchFacet[];
    categories: BatchFacet[];
    teachers: BatchFacet[];
    statuses: BatchFacet[];
  };
}

const emptyFacets = {
  exams: [] as BatchFacet[],
  classes: [] as BatchFacet[],
  languages: [] as BatchFacet[],
  categories: [] as BatchFacet[],
  teachers: [] as BatchFacet[],
  statuses: [] as BatchFacet[],
};

function BatchesExperience() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [page, setPage] = useState(Math.max(1, Number(params.get('page') ?? 1) || 1));
  const [filters, setFilters] = useState<BatchFiltersState>({
    q: params.get('q') ?? '',
    category: params.get('category') ?? '',
    exam: params.get('exam') ?? '',
    class: params.get('class') ?? '',
    language: params.get('language') ?? '',
    teacher: params.get('teacher') ?? '',
    status: params.get('status') ?? '',
    pricing: params.get('pricing') ?? '',
    duration: params.get('duration') ?? '',
    sort: params.get('sort') ?? 'popular',
  });
  const dq = useDebounce(filters.q, 280);

  const query = useMemo(() => {
    const u = new URLSearchParams();
    if (dq) u.set('q', dq);
    if (filters.category) u.set('category', filters.category);
    if (filters.exam) u.set('exam', filters.exam);
    if (filters.class) u.set('class', filters.class);
    if (filters.language) u.set('language', filters.language);
    if (filters.teacher) u.set('teacher', filters.teacher);
    if (filters.status) u.set('status', filters.status);
    if (filters.pricing) u.set('pricing', filters.pricing);
    if (filters.duration) u.set('duration', filters.duration);
    if (filters.sort && filters.sort !== 'popular') u.set('sort', filters.sort);
    u.set('page', String(page));
    u.set('limit', String(PAGE_SIZE));
    return u.toString();
  }, [dq, filters, page]);

  const catalog = useQuery({
    queryKey: ['batches-catalog', query],
    queryFn: () => api<Catalog>(`/api/batches?${query}`),
  });
  const overview = useQuery({
    queryKey: ['batches-overview'],
    queryFn: () => api<Catalog>('/api/batches?limit=100'),
    staleTime: 60_000,
  });

  function syncUrl(next: BatchFiltersState, nextPage = 1) {
    const u = new URLSearchParams();
    if (next.q) u.set('q', next.q);
    if (next.category) u.set('category', next.category);
    if (next.exam) u.set('exam', next.exam);
    if (next.class) u.set('class', next.class);
    if (next.language) u.set('language', next.language);
    if (next.teacher) u.set('teacher', next.teacher);
    if (next.status) u.set('status', next.status);
    if (next.pricing) u.set('pricing', next.pricing);
    if (next.duration) u.set('duration', next.duration);
    if (next.sort && next.sort !== 'popular') u.set('sort', next.sort);
    if (nextPage > 1) u.set('page', String(nextPage));
    const qs = u.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function patch(partial: Partial<BatchFiltersState>) {
    const next = { ...filters, ...partial };
    setFilters(next);
    setPage(1);
    syncUrl(next, 1);
  }

  function clear() {
    const next: BatchFiltersState = {
      q: '',
      category: '',
      exam: '',
      class: '',
      language: '',
      teacher: '',
      status: '',
      pricing: '',
      duration: '',
      sort: 'popular',
    };
    setFilters(next);
    setPage(1);
    syncUrl(next, 1);
  }

  function onHeroSearch(e: FormEvent) {
    e.preventDefault();
    document.getElementById('all-batches')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const facets = overview.data?.facets ?? catalog.data?.facets ?? emptyFacets;

  return (
    <main>
      <ScrollProgress />
      <BatchesHero
        stats={overview.data?.stats ?? catalog.data?.stats}
        featured={(overview.data?.featured ?? catalog.data?.featured ?? []).slice(0, 6)}
        query={filters.q}
        onQuery={(q) => patch({ q })}
        onSearch={onHeroSearch}
      />
      <div className="h-12 bg-gradient-to-b from-transparent via-gc-blue/5 to-transparent" aria-hidden />
      <div className="mt-8">
        <BatchSearch
          filters={filters}
          facets={facets}
          drawer={drawer}
          onDrawer={setDrawer}
          onChange={patch}
          onClear={clear}
        />
      </div>
      <FeaturedBatches batches={(overview.data?.featured ?? []).slice(0, 6)} />
      <BatchCategories
        categories={facets.categories.length ? facets.categories : facets.exams}
        onSelect={(name) => {
          patch({ category: name });
          document.getElementById('all-batches')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      <BatchBenefits />
      <LearningJourney />
      <BatchExploreGrid
        batches={catalog.data?.items ?? []}
        loading={catalog.isLoading}
        error={catalog.isError ? 'Unable to load batches. Please try again.' : undefined}
        onRetry={() => void catalog.refetch()}
        onClear={clear}
        page={page}
        pages={catalog.data?.pages ?? 1}
        onPage={(p) => {
          setPage(p);
          syncUrl(filters, p);
          document.getElementById('all-batches')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      <BatchCTA />
    </main>
  );
}

export function BatchesPageClient() {
  return (
    <Suspense>
      <BatchesExperience />
    </Suspense>
  );
}
