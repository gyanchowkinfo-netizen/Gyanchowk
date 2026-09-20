'use client';

import Link from 'next/link';
import { FacultyCarousel, FacultyCarouselSkeleton } from './FacultyCarousel';
import { fromCatalogTeacher, fromCmsFaculty } from '@/components/public/FacultyPortraitCard';
import { EmptyState } from '@/components/ui/States';
import type { HomeFacultyCard, HomeSectionCopy, TeacherCardData } from '@/lib/types';
import { SectionHeading } from './SectionHeading';

export function FacultySection({
  teachers,
  faculty,
  copy,
  loading,
}: {
  teachers: TeacherCardData[];
  faculty?: HomeFacultyCard[];
  copy?: HomeSectionCopy;
  loading?: boolean;
}) {
  const items = faculty?.length
    ? faculty.map(fromCmsFaculty)
    : teachers.slice(0, 8).map(fromCatalogTeacher);

  return (
    <section className="border-y border-gc-line/70 bg-[color:var(--gyan-surface)]/50" aria-labelledby="faculty">
      <div className="gc-container py-14 md:py-20">
        <SectionHeading
          id="faculty"
          kicker={copy?.kicker || 'Faculty'}
          title={copy?.title || 'Meet our educators'}
          subtitle={
            copy
              ? copy.subtitle
              : 'Approved educators teaching recorded programmes — without live-class noise.'
          }
          align="center"
        />
        {loading && !items.length ? (
          <FacultyCarouselSkeleton />
        ) : items.length ? (
          <FacultyCarousel items={items} />
        ) : (
          <EmptyState
            title="Faculty will appear here"
            body="Add faculty cards in CMS, or approved teachers will list here as they join the catalogue."
            action={{ href: '/teachers', label: 'View teachers' }}
          />
        )}
        {items.length ? (
          <p className="mt-8 text-center">
            <Link href="/teachers#all-teachers" className="gc-btn-outline">
              View all teachers
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
