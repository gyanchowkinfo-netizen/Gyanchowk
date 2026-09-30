'use client';

import { PageContainer } from '@/components/layout/Page';
import { EmptyState, ErrorState, Pagination } from '@/components/ui/States';
import { TeacherCard } from './TeacherCard';
import type { TeacherCardData } from '@/lib/types';

export function TeacherCardSkeleton() {
  return (
    <div className="h-96 animate-pulse rounded-[1.75rem] border border-[#ECE6DE] bg-stone-100/70 p-5" />
  );
}

export function TeacherGrid({
  teachers,
  loading,
  error,
  onRetry,
  onClear,
  page,
  pages,
  onPage,
  categories = [],
  selectedCategory,
  onSelectCategory,
  experienceFilter,
  onExperienceFilter,
  ratingFilter,
  onRatingFilter,
  sortFilter,
  onSortFilter,
}: {
  teachers: TeacherCardData[];
  loading: boolean;
  error?: string;
  onRetry: () => void;
  onClear: () => void;
  page: number;
  pages: number;
  onPage: (p: number) => void;
  categories?: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  experienceFilter: string;
  onExperienceFilter: (exp: string) => void;
  ratingFilter: number;
  onRatingFilter: (rat: number) => void;
  sortFilter: string;
  onSortFilter: (sort: string) => void;
}) {
  const defaultCategories = [
    'All',
    'Chemistry',
    'Physics',
    'Mathematics',
    'Biology',
    'English',
    'Computer Science',
    'General Studies',
    'Competitive Exams',
  ];

  // Merge unique categories
  const allCategories = Array.from(new Set(['All', ...categories, ...defaultCategories]));

  return (
    <section id="all-teachers" className="bg-[#FAF7F2] py-10 sm:py-12">
      <PageContainer>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-[#ECE5D8] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 border border-amber-200/70 px-3 py-0.5 text-[11px] font-bold tracking-wider text-amber-900 uppercase mb-2">
              Expert Faculty Directory
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1815]">
              Learn from <span className="font-serif italic font-normal text-amber-800">expert teachers</span>
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-stone-600 max-w-xl">
              Learn from teachers who make every concept clear through structured courses and personalized guidance.
            </p>
          </div>

          {/* Filters Bar: Sort & Rating */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Experience Filter */}
            <select
              value={experienceFilter}
              onChange={(e) => onExperienceFilter(e.target.value)}
              aria-label="Filter by experience"
              className="rounded-full border border-[#DCD5C9] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1C1815] shadow-sm outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Experience</option>
              <option value="3+">3+ Years</option>
              <option value="5+">5+ Years</option>
              <option value="8+">8+ Years</option>
              <option value="10+">10+ Years</option>
            </select>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => onRatingFilter(Number(e.target.value))}
              aria-label="Filter by rating"
              className="rounded-full border border-[#DCD5C9] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1C1815] shadow-sm outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value={0}>All Ratings</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={4.8}>4.8+ Stars</option>
              <option value={5.0}>5.0 Stars</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortFilter}
              onChange={(e) => onSortFilter(e.target.value)}
              aria-label="Sort teachers"
              className="rounded-full border border-[#DCD5C9] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1C1815] shadow-sm outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="featured">Featured First</option>
              <option value="rating">Highest Rated</option>
              <option value="students">Most Students</option>
              <option value="courses">Most Courses</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-5">
          {allCategories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#1C1815] text-white shadow-sm'
                    : 'border border-[#E4DDD2] bg-white text-[#5C544D] hover:bg-[#F2EDE4] hover:text-[#1C1815]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grid Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <TeacherCardSkeleton key={i} />
            ))}
          </div>
        ) : null}

        {error ? <ErrorState message={error} onRetry={onRetry} /> : null}

        {!loading && !error && !teachers.length ? (
          <EmptyState
            title="No teachers found"
            body="Try changing your search, category or filter options."
            action={{ label: 'Clear filters', onClick: onClear }}
          />
        ) : null}

        {!loading && !error && teachers.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher._id || teacher.slug} teacher={teacher} />
            ))}
          </div>
        ) : null}

        {!loading && !error && pages > 1 ? (
          <div className="mt-10 flex justify-center">
            <Pagination page={page} pages={pages} onPage={onPage} />
          </div>
        ) : null}
      </PageContainer>
    </section>
  );
}
