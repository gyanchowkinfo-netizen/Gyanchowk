'use client';

import Link from 'next/link';
import { Rating } from '@/components/ui/Badge';
import type { TeacherCardData } from '@/lib/types';
import { cn } from '@/lib/format';

function initials(name?: string) {
  return (name ?? 'G')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function TeacherCard({
  teacher,
  featured,
  href,
}: {
  teacher: TeacherCardData;
  featured?: boolean;
  href?: string;
}) {
  const subjects = (teacher.subjects?.length ? teacher.subjects : teacher.categories) ?? [];
  const photo = teacher.avatar?.url;
  const profileHref = href || `/teachers/${teacher._id}`;

  return (
    <article className={cn('gc-card gc-card-lift gc-teacher-card group flex h-full flex-col overflow-hidden p-6 text-center', featured && 'p-7')}>
      <div className="gc-teacher-photo">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={teacher.name} />
        ) : (
          <span className="gc-teacher-fallback" aria-hidden>
            {initials(teacher.name)}
          </span>
        )}
      </div>
      {teacher.ratingCount ? (
        <p className="mt-4 text-sm">
          <Rating value={teacher.ratingAvg} count={teacher.ratingCount} />
        </p>
      ) : (
        <p className="mt-4 text-xs leading-snug text-gc-mute">Ratings appear after verified course reviews</p>
      )}
      <h3 className={cn('mt-3 font-display font-semibold tracking-tight text-gc-black', featured ? 'text-2xl' : 'text-xl')}>
        {teacher.name}
      </h3>
      <p className="mt-1 text-sm font-medium text-gc-mist">{teacher.headline || 'Gyan Chowk faculty'}</p>
      {subjects.length ? <p className="mt-1 text-xs text-gc-mute">{subjects.slice(0, 3).join(' • ')}</p> : null}
      {teacher.bio ? <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-gc-mist">{teacher.bio}</p> : <div className="flex-1" />}
      <dl className="mt-5 grid grid-cols-2 gap-2">
        <div className="gc-teacher-stat">
          <dt>Courses</dt>
          <dd>{teacher.courseCount ?? 0}</dd>
        </div>
        <div className="gc-teacher-stat">
          <dt>Enrollments</dt>
          <dd>{teacher.enrollmentCount ?? 0}</dd>
        </div>
      </dl>
      <Link href={profileHref} className="gc-teacher-profile mt-5">
        View profile <span className="gc-btn-arrow">→</span>
      </Link>
    </article>
  );
}
