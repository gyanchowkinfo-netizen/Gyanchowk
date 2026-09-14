'use client';

import { Filter, Search } from 'lucide-react';
import { Drawer } from '@/components/ui/Overlay';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import type { BatchFacet } from '@/lib/types';

export interface BatchFiltersState {
  q: string;
  category: string;
  exam: string;
  class: string;
  language: string;
  teacher: string;
  status: string;
  pricing: string;
  duration: string;
  sort: string;
}

export function BatchSearch({
  filters,
  facets,
  drawer,
  onDrawer,
  onChange,
  onClear,
}: {
  filters: BatchFiltersState;
  facets: {
    exams: BatchFacet[];
    classes: BatchFacet[];
    languages: BatchFacet[];
    categories: BatchFacet[];
    teachers: BatchFacet[];
    statuses: BatchFacet[];
  };
  drawer: boolean;
  onDrawer: (open: boolean) => void;
  onChange: (patch: Partial<BatchFiltersState>) => void;
  onClear: () => void;
}) {
  const chips = [
    filters.category && { key: 'category', label: filters.category },
    filters.exam && { key: 'exam', label: filters.exam },
    filters.class && { key: 'class', label: `Class ${filters.class}` },
    filters.language && { key: 'language', label: `Lang: ${filters.language}` },
    filters.teacher && { key: 'teacher', label: filters.teacher },
    filters.status && { key: 'status', label: filters.status },
    filters.pricing && { key: 'pricing', label: filters.pricing },
    filters.duration && { key: 'duration', label: filters.duration },
  ].filter(Boolean) as Array<{ key: keyof BatchFiltersState; label: string }>;

  const fields = (prefix: string, className = 'grid gap-3') => (
    <div className={className}>
      <Select id={`${prefix}-exam`} label="Exam" value={filters.exam} onChange={(e) => onChange({ exam: e.target.value })}>
        <option value="">All exams</option>
        {facets.exams.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name} ({s.count})
          </option>
        ))}
      </Select>
      <Select id={`${prefix}-class`} label="Class" value={filters.class} onChange={(e) => onChange({ class: e.target.value })}>
        <option value="">All classes</option>
        {facets.classes.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name} ({s.count})
          </option>
        ))}
      </Select>
      <Select id={`${prefix}-lang`} label="Language" value={filters.language} onChange={(e) => onChange({ language: e.target.value })}>
        <option value="">All languages</option>
        {facets.languages.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name} ({s.count})
          </option>
        ))}
      </Select>
      <Select id={`${prefix}-teacher`} label="Teacher" value={filters.teacher} onChange={(e) => onChange({ teacher: e.target.value })}>
        <option value="">All teachers</option>
        {facets.teachers.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name} ({s.count})
          </option>
        ))}
      </Select>
      <Select id={`${prefix}-status`} label="Status" value={filters.status} onChange={(e) => onChange({ status: e.target.value })}>
        <option value="">Open programmes</option>
        {facets.statuses.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name} ({s.count})
          </option>
        ))}
      </Select>
      <Select id={`${prefix}-price`} label="Price" value={filters.pricing} onChange={(e) => onChange({ pricing: e.target.value })}>
        <option value="">Any price</option>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
      </Select>
      <Select id={`${prefix}-duration`} label="Duration" value={filters.duration} onChange={(e) => onChange({ duration: e.target.value })}>
        <option value="">Any duration</option>
        <option value="short">Under 90 days</option>
        <option value="medium">90–180 days</option>
        <option value="long">Over 180 days</option>
      </Select>
    </div>
  );

  return (
    <section id="batch-search" className="mx-auto max-w-7xl px-4">
      <div className="gc-card p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gc-mute" size={16} aria-hidden />
            <input
              className="gc-input pl-10 transition-[border-color,box-shadow,transform] duration-300 focus:-translate-y-0.5 focus:shadow-[0_12px_40px_rgba(30,111,255,0.12)]"
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Search by name, course, exam or teacher"
              aria-label="Filter batches"
            />
          </label>
          <Select value={filters.sort} onChange={(e) => onChange({ sort: e.target.value })} className="md:w-52" id="batch-sort">
            <option value="popular">Sort: Popular</option>
            <option value="newest">Sort: Newest</option>
            <option value="price_asc">Sort: Price low to high</option>
            <option value="price_desc">Sort: Price high to low</option>
            <option value="rating">Sort: Rating</option>
            <option value="students">Sort: Enrollments</option>
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
      <Drawer open={drawer} title="Batch filters" onClose={() => onDrawer(false)}>
        {fields('drawer')}
        <Button className="mt-6 w-full" type="button" onClick={() => onDrawer(false)}>
          Apply
        </Button>
      </Drawer>
    </section>
  );
}
