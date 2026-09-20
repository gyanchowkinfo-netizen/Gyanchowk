'use client';

import { PageContainer, SectionHeader } from '@/components/layout/Page';
import { EmptyState, ErrorState, Pagination } from '@/components/ui/States';
import { FacultyPortraitCard, fromCatalogTeacher, fromCmsFaculty } from '@/components/public/FacultyPortraitCard';
import type { HomeFacultyCard, TeacherCardData } from '@/lib/types';

export function TeacherCardSkeleton() {
  return <div className="gc-faculty-card animate-pulse bg-[color:var(--gyan-primary-soft)]" />;
}

export function TeacherGrid({
  teachers,
  faculty,
  loading,
  error,
  onRetry,
  onClear,
  page,
  pages,
  onPage,
}: {
  teachers: TeacherCardData[];
  faculty?: HomeFacultyCard[];
  loading: boolean;
  error?: string;
  onRetry: () => void;
  onClear: () => void;
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  const items = faculty !== undefined ? faculty.map(fromCmsFaculty) : teachers.map(fromCatalogTeacher);

  return (
    <section id="all-teachers">
      <PageContainer>
        <SectionHeader title="All teachers" subtitle="The same faculty cards published from Admin CMS." />
        {loading ? (
          <div className="gc-faculty-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <TeacherCardSkeleton key={i} />
            ))}
          </div>
        ) : null}
        {error ? <ErrorState message={error} onRetry={onRetry} /> : null}
        {!loading && !error && !items.length ? (
          <EmptyState
            title="No teachers found"
            body="Add faculty cards in CMS, or try changing your search or filters."
            action={{ label: 'Clear filters', onClick: onClear }}
          />
        ) : null}
        {!loading && !error && items.length ? (
          <div className="gc-faculty-grid">
            {items.map((item) => (
              <FacultyPortraitCard key={item.id} item={item} />
            ))}
          </div>
        ) : null}
        {!loading && !error && pages > 1 ? <Pagination page={page} pages={pages} onPage={onPage} /> : null}
      </PageContainer>
    </section>
  );
}
