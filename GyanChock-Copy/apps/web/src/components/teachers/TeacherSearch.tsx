'use client';

import { Filter, Search } from 'lucide-react';
import { Drawer } from '@/components/ui/Overlay';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import type { TeacherFacet } from '@/lib/types';

export interface TeacherFiltersState {
  q: string;
  subject: string;
  exam: string;
  language: string;
  minRating: string;
  sort: string;
}

export function TeacherSearch({
  filters,
  facets,
  drawer,
  onDrawer,
  onChange,
  onClear,
}: {
  filters: TeacherFiltersState;
  facets: { subjects: TeacherFacet[]; exams: TeacherFacet[]; languages: TeacherFacet[] };
  drawer: boolean;
  onDrawer: (open: boolean) => void;
  onChange: (patch: Partial<TeacherFiltersState>) => void;
  onClear: () => void;
}) {
  const chips = [
    filters.subject && { key: 'subject', label: filters.subject },
    filters.exam && { key: 'exam', label: filters.exam },
    filters.language && { key: 'language', label: `Lang: ${filters.language}` },
    filters.minRating && { key: 'minRating', label: `${filters.minRating}+ rating` },
  ].filter(Boolean) as Array<{ key: keyof TeacherFiltersState; label: string }>;

  const fields = (prefix: string, className = 'grid gap-3') => (
    <div className={className}>
      <Select id={`${prefix}-subject`} label="Subject" value={filters.subject} onChange={(e) => onChange({ subject: e.target.value })}>
        <option value="">All subjects</option>
        {facets.subjects.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name} ({s.count})
          </option>
        ))}
      </Select>
      <Select id={`${prefix}-exam`} label="Exam" value={filters.exam} onChange={(e) => onChange({ exam: e.target.value })}>
        <option value="">All exams</option>
        {facets.exams.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name} ({s.count})
          </option>
        ))}
      </Select>
      <Select id={`${prefix}-language`} label="Language" value={filters.language} onChange={(e) => onChange({ language: e.target.value })}>
        <option value="">All languages</option>
        {facets.languages.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name} ({s.count})
          </option>
        ))}
      </Select>
      <Select id={`${prefix}-rating`} label="Minimum rating" value={filters.minRating} onChange={(e) => onChange({ minRating: e.target.value })}>
        <option value="">Any rating</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
        <option value="4.5">4.5+</option>
      </Select>
    </div>
  );

  return (
    <section id="teachers-search" className="mx-auto max-w-7xl px-4">
      <div className="gc-card p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gc-mute" size={16} aria-hidden />
            <input
              className="gc-input pl-10 transition-[border-color,box-shadow,transform] duration-300 focus:-translate-y-0.5 focus:shadow-[0_12px_40px_rgba(30,111,255,0.12)]"
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Search by name, headline or subject"
              aria-label="Filter teachers"
            />
          </label>
          <Select value={filters.sort} onChange={(e) => onChange({ sort: e.target.value })} className="md:w-48" id="teacher-sort">
            <option value="featured">Sort: Featured</option>
            <option value="students">Sort: Enrollments</option>
            <option value="courses">Sort: Courses</option>
            <option value="name">Sort: Name</option>
            <option value="new">Sort: Newest</option>
          </Select>
          <Button variant="ghost" type="button" className="lg:hidden" onClick={() => onDrawer(true)}>
            <Filter size={16} className="mr-2" />
            Filters
          </Button>
        </div>
        {chips.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                className="rounded-full border border-gc-gold/40 px-3 py-1 text-xs text-gc-gold"
                onClick={() => onChange({ [c.key]: '' })}
              >
                {c.label} ×
              </button>
            ))}
            <button type="button" className="text-xs text-gc-glow" onClick={onClear}>
              Clear filters
            </button>
          </div>
        ) : null}
        <div className="mt-4 hidden lg:block">{fields('desktop', 'grid gap-3 lg:grid-cols-4')}</div>
      </div>
      <Drawer open={drawer} title="Teacher filters" onClose={() => onDrawer(false)}>
        {fields('drawer')}
        <Button className="mt-6 w-full" type="button" onClick={() => onDrawer(false)}>
          Apply
        </Button>
      </Drawer>
    </section>
  );
}
