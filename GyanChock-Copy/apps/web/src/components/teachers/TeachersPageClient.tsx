'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import { ScrollProgress } from '@/components/motion';
import type { TeacherCardData, TeachersPageConfig } from '@/lib/types';
import { DEFAULT_TEACHERS_PAGE_CONFIG } from '@/lib/types';
import { TeachersHero } from './TeachersHero';
import { TeachersWhySection } from './TeachersWhySection';
import { TeacherGrid } from './TeacherGrid';
import { BecomeTeacherCTA } from './BecomeTeacherCTA';

const PAGE_SIZE = 12;

interface TeachersResponse {
  items: TeacherCardData[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  categories: string[];
}

function TeachersExperience({ initialData }: { initialData?: TeachersResponse }) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(params.get('category') ?? 'All');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortFilter, setSortFilter] = useState('featured');
  const [page, setPage] = useState(Math.max(1, Number(params.get('page') ?? 1) || 1));
  const dq = useDebounce(query, 280);

  // Fetch published CMS configuration for Teachers Page (Hero, Why, Become CTA)
  const cmsPageQuery = useQuery({
    queryKey: ['teachers-page-cms'],
    queryFn: () => api<{ teachersPage?: TeachersPageConfig | null }>('/api/cms/teachers-page'),
  });

  const cmsConfig: TeachersPageConfig = useMemo(() => {
    const remote = cmsPageQuery.data?.teachersPage;
    if (!remote) return DEFAULT_TEACHERS_PAGE_CONFIG;
    return {
      hero: {
        ...DEFAULT_TEACHERS_PAGE_CONFIG.hero,
        ...remote.hero,
        badges: remote.hero?.badges?.length ? remote.hero.badges : DEFAULT_TEACHERS_PAGE_CONFIG.hero.badges,
      },
      whyLearn: {
        ...DEFAULT_TEACHERS_PAGE_CONFIG.whyLearn,
        ...remote.whyLearn,
        cards: remote.whyLearn?.cards?.length ? remote.whyLearn.cards : DEFAULT_TEACHERS_PAGE_CONFIG.whyLearn.cards,
      },
      becomeTeacher: {
        ...DEFAULT_TEACHERS_PAGE_CONFIG.becomeTeacher,
        ...remote.becomeTeacher,
      },
    };
  }, [cmsPageQuery.data?.teachersPage]);

  // Main Teachers Query
  const teachersQuery = useQuery({
    queryKey: ['teachers-list', dq, selectedCategory, experienceFilter, ratingFilter, sortFilter, page],
    queryFn: async () => {
      const qParams = new URLSearchParams();
      if (dq) qParams.set('q', dq);
      if (selectedCategory && selectedCategory.toLowerCase() !== 'all') {
        qParams.set('category', selectedCategory);
      }
      if (experienceFilter && experienceFilter !== 'all') {
        qParams.set('experience', experienceFilter);
      }
      if (ratingFilter > 0) {
        qParams.set('minRating', String(ratingFilter));
      }
      if (sortFilter) {
        qParams.set('sort', sortFilter);
      }
      qParams.set('page', String(page));
      qParams.set('limit', String(PAGE_SIZE));

      return api<TeachersResponse>(`/api/teachers?${qParams.toString()}`);
    },
    initialData:
      dq || selectedCategory !== 'All' || experienceFilter !== 'all' || ratingFilter > 0 || sortFilter !== 'featured' || page !== 1
        ? undefined
        : initialData,
  });

  const items = teachersQuery.data?.items ?? [];
  const pages = teachersQuery.data?.pages ?? 1;
  const categories = teachersQuery.data?.categories ?? [];

  function onHeroSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    document.getElementById('all-teachers')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function clearSearch() {
    setQuery('');
    setSelectedCategory('All');
    setExperienceFilter('all');
    setRatingFilter(0);
    setSortFilter('featured');
    setPage(1);
  }

  return (
    <main>
      <ScrollProgress />

      {/* 1. YOUR LEARNING PARTNER / HERO (CMS Manageable) */}
      <TeachersHero
        heroConfig={cmsConfig.hero}
        query={query}
        onQuery={setQuery}
        onSearch={onHeroSearch}
      />

      {/* 2. WHY LEARN FROM GYAN CHOWK TEACHERS (CMS Manageable) */}
      <TeachersWhySection whyConfig={cmsConfig.whyLearn} />

      {/* 3. ALL TEACHERS (Rich cards, Category Filter, Rating, Experience, Sorting) */}
      <TeacherGrid
        teachers={items}
        loading={teachersQuery.isLoading}
        error={teachersQuery.isError ? 'Unable to load teachers. Please try again.' : undefined}
        onRetry={() => void teachersQuery.refetch()}
        onClear={clearSearch}
        page={page}
        pages={pages}
        onPage={(p) => {
          setPage(p);
          document.getElementById('all-teachers')?.scrollIntoView({ behavior: 'smooth' });
        }}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setPage(1);
        }}
        experienceFilter={experienceFilter}
        onExperienceFilter={(exp) => {
          setExperienceFilter(exp);
          setPage(1);
        }}
        ratingFilter={ratingFilter}
        onRatingFilter={(rat) => {
          setRatingFilter(rat);
          setPage(1);
        }}
        sortFilter={sortFilter}
        onSortFilter={(sort) => {
          setSortFilter(sort);
          setPage(1);
        }}
      />

      {/* 4. SHARE YOUR KNOWLEDGE / BECOME A GYAN CHOWK TEACHER (CMS Manageable) */}
      <BecomeTeacherCTA ctaConfig={cmsConfig.becomeTeacher} />
    </main>
  );
}

export function TeachersPageClient({ initialData }: { initialData?: TeachersResponse }) {
  return (
    <Suspense>
      <TeachersExperience initialData={initialData} />
    </Suspense>
  );
}

