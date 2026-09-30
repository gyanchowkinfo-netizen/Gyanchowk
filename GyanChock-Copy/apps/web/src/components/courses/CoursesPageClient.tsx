'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ArrowUpDown, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layout/Page';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Drawer } from '@/components/ui/Overlay';
import { useDebounce } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import type { CourseCardData, CoursesPageConfig } from '@/lib/types';
import { useCompare } from '@/lib/compare';
import { ScrollProgress } from '@/components/motion';

import { CoursesHero } from './CoursesHero';
import { FeaturedPromoBanner } from './FeaturedPromoBanner';
import { CoursesPageContentEditor } from '@/components/admin/CoursesPageContentEditor';
import { CourseEditModal } from '@/components/admin/CourseEditModal';
import {
  MarketplaceFilterSidebar,
  MarketplaceFilterFields,
} from './MarketplaceFilterSidebar';
import { MarketplaceCourseCard } from './MarketplaceCourseCard';
import { MarketplacePagination } from './MarketplacePagination';
import { TrustBenefitsStrip } from './TrustBenefitsStrip';
import { CategoryDiscoverySection } from './CategoryDiscoverySection';
import type { CourseFiltersState } from './CourseCatalogToolbar';

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
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [filters, setFilters] = useState<CourseFiltersState>(() =>
    emptyFilters(params.get('category') ?? ''),
  );
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
    queryFn: () =>
      api<{ items: CourseCardData[]; total: number; pages: number }>(`/api/courses?${query}`),
    placeholderData: (prev) => prev,
    retry: 1,
  });

  const meta = useQuery({
    queryKey: ['course-meta'],
    queryFn: () =>
      api<{
        categories: string[];
        subjects: string[];
        exams: string[];
        classes: string[];
        languages: string[];
      }>('/api/courses/meta'),
    staleTime: 60_000,
  });

  const user = useAuth((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseCardData | null>(null);

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setCourseModalOpen(true);
  };

  const handleEditCourse = (course: CourseCardData) => {
    setEditingCourse(course);
    setCourseModalOpen(true);
  };

  const cmsData = useQuery({
    queryKey: ['courses-page-cms'],
    queryFn: () => api<{ coursesPage?: CoursesPageConfig | null }>('/api/cms/courses-page'),
    staleTime: 30_000,
  });

  const compareIds = useCompare((s) => s.ids);
  const clearCompare = useCompare((s) => s.clear);

  function patchFilters(partial: Partial<CourseFiltersState>) {
    setPage(1);
    setFilters((f) => ({ ...f, ...partial }));
  }

  function clearFilters() {
    setPage(1);
    setQ('');
    setFilters(emptyFilters());
  }

  const items = list.data?.items ?? [];
  const total = list.data?.total ?? items.length;
  const pages = list.data?.pages ?? 1;

  return (
    <main className="min-h-screen bg-[#faf8f5] text-slate-900">
      <ScrollProgress />

      {/* Hero Section */}
      <CoursesHero
        total={list.data?.total}
        query={q}
        onQuery={(v) => {
          setPage(1);
          setQ(v);
        }}
        onSearch={(e) => {
          e.preventDefault();
          document.getElementById('course-catalog-view')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }}
        config={cmsData.data?.coursesPage?.hero}
        onEdit={isAdmin ? () => setAdminModalOpen(true) : undefined}
      />

      <PageContainer className="pb-16 pt-8 sm:pt-10">
        {/* Compare Bar Floating notification */}
        {compareIds.length ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm shadow-sm backdrop-blur-sm">
            <span className="font-medium text-blue-900">
              {compareIds.length} course{compareIds.length === 1 ? '' : 's'} selected for comparison (max 3)
            </span>
            <div className="flex items-center gap-2">
              <Link
                href="/courses/compare"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Compare Now
              </Link>
              <button
                suppressHydrationWarning
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                type="button"
                onClick={clearCompare}
              >
                Clear
              </button>
            </div>
          </div>
        ) : null}

        {/* Catalog Main Layout (Sidebar + Courses Grid) */}
        <div id="course-catalog-view" className="grid gap-8 lg:grid-cols-[260px_1fr] items-start">
          {/* Desktop Filter Sidebar */}
          <MarketplaceFilterSidebar
            filters={filters}
            meta={meta.data}
            onChange={patchFilters}
            onClear={clearFilters}
          />

          {/* Right Column Content */}
          <div className="min-w-0">
            {/* Featured Promotional Banner */}
            <FeaturedPromoBanner
              config={cmsData.data?.coursesPage?.featuredPromo}
              onEdit={isAdmin ? () => setAdminModalOpen(true) : undefined}
              onExplore={() => {
                patchFilters({ pricing: '' });
                document.getElementById('courses-grid-heading')?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            />

            {/* Popular Courses Section Header & Controls */}
            <div
              id="courses-grid-heading"
              className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4"
            >
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Popular Courses
                </h2>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  {list.isLoading
                    ? 'Loading courses…'
                    : total > 0
                      ? `Showing ${items.length} of ${total} available courses`
                      : 'Explore curated courses'}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Admin Add Course button */}
                {isAdmin && (
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={handleCreateCourse}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100"
                  >
                    <Plus size={14} className="text-amber-700" />
                    <span>Add Course</span>
                  </button>
                )}

                {/* Mobile Filter Toggle */}
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setMobileDrawer(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden"
                >
                  <SlidersHorizontal size={14} />
                  <span>Filters</span>
                </button>

                {/* Sort dropdown */}
                <div className="relative flex items-center">
                  <ArrowUpDown size={14} className="pointer-events-none absolute left-3 text-slate-400" />
                  <select
                    suppressHydrationWarning
                    value={filters.sort}
                    onChange={(e) => patchFilters({ sort: e.target.value })}
                    aria-label="Sort courses"
                    className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-7 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="new">Newest First</option>
                    <option value="rating">Top Rated</option>
                    <option value="price">Price: Low to High</option>
                  </select>
                  <div className="pointer-events-none absolute right-2.5 text-slate-400 text-[10px]">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* Courses State / Grid */}
            {list.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                    <div className="aspect-[16/10] w-full animate-pulse bg-slate-200" />
                    <div className="flex flex-col gap-3 p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded-lg bg-slate-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded-lg bg-slate-100" />
                      <div className="h-3 w-2/3 animate-pulse rounded-lg bg-slate-100" />
                      <div className="mt-4 flex items-center justify-between">
                        <div className="h-5 w-1/4 animate-pulse rounded-lg bg-slate-200" />
                        <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {list.error ? (
              <div className="py-8">
                <ErrorState
                  message={(list.error as Error).message}
                  onRetry={() => void list.refetch()}
                />
              </div>
            ) : null}

            {!list.isLoading && list.data != null && !items.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
                <EmptyState
                  title="No courses found"
                  body="Try adjusting your filters or search terms to find what you are looking for."
                />
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  Reset all filters
                </button>
              </div>
            ) : null}

            {items.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                  {items.map((course, idx) => (
                    <MarketplaceCourseCard
                      key={course._id}
                      course={course}
                      index={idx}
                      onEdit={isAdmin ? handleEditCourse : undefined}
                      onDelete={isAdmin ? handleEditCourse : undefined}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <MarketplacePagination
                  page={page}
                  pages={pages}
                  onPage={(newPage) => {
                    setPage(newPage);
                    document.getElementById('courses-grid-heading')?.scrollIntoView({
                      behavior: 'smooth',
                    });
                  }}
                />
              </>
            ) : null}
          </div>
        </div>

        {/* Trust & Benefits Strip */}
        <TrustBenefitsStrip />

        {/* Explore by Category Discovery Section */}
        <CategoryDiscoverySection
          categories={meta.data?.categories}
          selectedCategory={filters.category}
          onSelectCategory={(cat) => {
            patchFilters({ category: cat });
            document.getElementById('course-catalog-view')?.scrollIntoView({
              behavior: 'smooth',
            });
          }}
        />
      </PageContainer>

      {/* Mobile Drawer for Filters */}
      <Drawer
        open={mobileDrawer}
        title="Filter Courses"
        onClose={() => setMobileDrawer(false)}
      >
        <div className="p-1">
          <MarketplaceFilterFields
            filters={filters}
            meta={meta.data}
            onChange={patchFilters}
            onApply={() => setMobileDrawer(false)}
            onClear={() => {
              clearFilters();
              setMobileDrawer(false);
            }}
          />
        </div>
      </Drawer>

      {/* Admin Content Drawer directly accessible on Courses Page */}
      {isAdmin && (
        <>
          <Drawer
            open={adminModalOpen}
            onClose={() => setAdminModalOpen(false)}
            title="Manage Courses Page Content"
          >
            <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
              <CoursesPageContentEditor onClose={() => setAdminModalOpen(false)} />
            </div>
          </Drawer>

          <CourseEditModal
            course={editingCourse}
            open={courseModalOpen}
            onClose={() => setCourseModalOpen(false)}
            onSaved={() => void list.refetch()}
            onDeleted={() => void list.refetch()}
          />
        </>
      )}
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
