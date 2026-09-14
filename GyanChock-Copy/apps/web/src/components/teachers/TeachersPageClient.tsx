'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import { ScrollProgress } from '@/components/motion';
import type { TeacherCardData, TeacherCatalogStats, TeacherFacet } from '@/lib/types';
import { TeachersHero } from './TeachersHero';
import { TeacherSearch, type TeacherFiltersState } from './TeacherSearch';
import { FeaturedTeachers } from './FeaturedTeachers';
import { TeacherStats } from './TeacherStats';
import { TeacherExpertise } from './TeacherExpertise';
import { TeacherCategories } from './TeacherCategories';
import { TeacherGrid } from './TeacherGrid';
import { BecomeTeacherCTA } from './BecomeTeacherCTA';

const PAGE_SIZE = 12;

interface Catalog {
  items: TeacherCardData[];
  featured?: TeacherCardData[];
  stats?: TeacherCatalogStats;
  facets?: {
    subjects: TeacherFacet[];
    exams: TeacherFacet[];
    languages: TeacherFacet[];
    categories: TeacherFacet[];
  };
}

function sortTeachers(items: TeacherCardData[], sort: string) {
  const next = [...items];
  next.sort((a, b) => {
    if (sort === 'students') return (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0) || a.name.localeCompare(b.name);
    if (sort === 'courses') return (b.courseCount ?? 0) - (a.courseCount ?? 0) || a.name.localeCompare(b.name);
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'new') return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    return (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0) || (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0) || a.name.localeCompare(b.name);
  });
  return next;
}

function WaveDivider() {
  return <div className="h-12 bg-gradient-to-b from-transparent via-gc-blue/5 to-transparent" aria-hidden />;
}

function TeachersExperience() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [page, setPage] = useState(Math.max(1, Number(params.get('page') ?? 1) || 1));
  const [filters, setFilters] = useState<TeacherFiltersState>({
    q: params.get('q') ?? '',
    subject: params.get('subject') ?? '',
    exam: params.get('exam') ?? '',
    language: params.get('language') ?? '',
    minRating: params.get('minRating') ?? '',
    sort: params.get('sort') ?? 'featured',
  });
  const dq = useDebounce(filters.q, 280);

  const catalog = useQuery({
    queryKey: ['teachers-catalog'],
    queryFn: () => api<Catalog>('/api/catalog/teachers?limit=100'),
  });

  function syncUrl(next: TeacherFiltersState, nextPage = 1) {
    const u = new URLSearchParams();
    if (next.q) u.set('q', next.q);
    if (next.subject) u.set('subject', next.subject);
    if (next.exam) u.set('exam', next.exam);
    if (next.language) u.set('language', next.language);
    if (next.minRating) u.set('minRating', next.minRating);
    if (next.sort && next.sort !== 'featured') u.set('sort', next.sort);
    if (nextPage > 1) u.set('page', String(nextPage));
    const qs = u.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function patch(partial: Partial<TeacherFiltersState>) {
    const next = { ...filters, ...partial };
    setFilters(next);
    setPage(1);
    syncUrl(next, 1);
  }

  function clear() {
    const next: TeacherFiltersState = { q: '', subject: '', exam: '', language: '', minRating: '', sort: 'featured' };
    setFilters(next);
    setPage(1);
    syncUrl(next, 1);
  }

  const filtered = useMemo(() => {
    let items = catalog.data?.items ?? [];
    if (dq) {
      const rx = new RegExp(dq.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      items = items.filter(
        (t) =>
          rx.test(t.name) ||
          rx.test(t.headline ?? '') ||
          rx.test(t.bio ?? '') ||
          (t.subjects ?? []).some((s) => rx.test(s)) ||
          (t.exams ?? []).some((s) => rx.test(s)),
      );
    }
    if (filters.subject) {
      const s = filters.subject.toLowerCase();
      items = items.filter(
        (t) =>
          (t.subjects ?? []).some((x) => x.toLowerCase() === s) ||
          (t.categories ?? []).some((x) => x.toLowerCase() === s),
      );
    }
    if (filters.exam) {
      const s = filters.exam.toLowerCase();
      items = items.filter((t) => (t.exams ?? []).some((x) => x.toLowerCase() === s));
    }
    if (filters.language) {
      const s = filters.language.toLowerCase();
      items = items.filter((t) => (t.languages ?? []).some((x) => x.toLowerCase() === s));
    }
    if (filters.minRating) items = items.filter((t) => (t.ratingAvg ?? 0) >= Number(filters.minRating));
    return sortTeachers(items, filters.sort);
  }, [catalog.data?.items, dq, filters.subject, filters.exam, filters.language, filters.minRating, filters.sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function onHeroSearch(e: FormEvent) {
    e.preventDefault();
    document.getElementById('all-teachers')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main>
      <ScrollProgress />
      <TeachersHero stats={catalog.data?.stats} query={filters.q} onQuery={(q) => patch({ q })} onSearch={onHeroSearch} />
      <WaveDivider />
      <div className="mt-8">
        <TeacherSearch
          filters={filters}
          facets={{
            subjects: catalog.data?.facets?.subjects ?? [],
            exams: catalog.data?.facets?.exams ?? [],
            languages: catalog.data?.facets?.languages ?? [],
          }}
          drawer={drawer}
          onDrawer={setDrawer}
          onChange={patch}
          onClear={clear}
        />
      </div>
      <FeaturedTeachers teachers={(catalog.data?.featured ?? []).slice(0, 6)} />
      <TeacherStats stats={catalog.data?.stats} />
      <TeacherExpertise />
      <TeacherCategories
        categories={catalog.data?.facets?.categories?.length ? catalog.data.facets.categories : catalog.data?.facets?.subjects ?? []}
        onSelect={(name) => {
          patch({ subject: name });
          document.getElementById('all-teachers')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      <TeacherGrid
        teachers={pageItems}
        loading={catalog.isLoading}
        error={catalog.isError ? 'Unable to load teachers. Please try again.' : undefined}
        onRetry={() => void catalog.refetch()}
        onClear={clear}
        page={currentPage}
        pages={pages}
        onPage={(p) => {
          setPage(p);
          syncUrl(filters, p);
          document.getElementById('all-teachers')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      <BecomeTeacherCTA />
    </main>
  );
}

export function TeachersPageClient() {
  return (
    <Suspense>
      <TeachersExperience />
    </Suspense>
  );
}
