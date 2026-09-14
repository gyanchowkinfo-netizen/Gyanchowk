'use client';

import Link from 'next/link';
import { Avatar, Rating } from '@/components/ui/Badge';
import type { TeacherCardData } from '@/lib/types';
import { TiltCard } from '@/components/motion';
import { cn } from '@/lib/format';

export function TeacherCard({ teacher, featured }: { teacher: TeacherCardData; featured?: boolean }) {
  const subjects = (teacher.subjects?.length ? teacher.subjects : teacher.categories) ?? [];
  return (
    <TiltCard intensity={5} className="h-full">
      <Link
        href={`/teachers/${teacher._id}`}
        className={cn(
          'gc-card group relative flex h-full flex-col overflow-hidden p-5 hover:border-gc-gold',
          featured && 'p-6',
        )}
      >
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        </div>
        <div className="relative mx-auto overflow-hidden rounded-2xl">
          <div className="transition-transform duration-300 group-hover:scale-[1.04]">
            <Avatar name={teacher.name} src={teacher.avatar?.url} size={featured ? 112 : 72} />
          </div>
        </div>
        {teacher.ratingCount ? (
          <p className="mt-3 text-center text-sm text-gc-gold">
            <Rating value={teacher.ratingAvg} count={teacher.ratingCount} />
          </p>
        ) : (
          <p className="mt-3 text-center text-xs text-gc-mute">Ratings appear after verified course reviews</p>
        )}
        <h3 className={cn('mt-3 font-display group-hover:text-gc-gold', featured ? 'text-2xl' : 'text-lg')}>{teacher.name}</h3>
        <p className="text-sm text-gc-gold">{teacher.headline || 'Gyan Chowk faculty'}</p>
        {subjects.length ? <p className="mt-1 text-xs text-gc-mute">{subjects.slice(0, 3).join(' • ')}</p> : null}
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-gc-mist">{teacher.bio}</p>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-gc-mute">
          <div>
            <dt>Courses</dt>
            <dd className="font-display text-sm text-gc-blue">{teacher.courseCount ?? 0}</dd>
          </div>
          <div>
            <dt>Enrollments</dt>
            <dd className="font-display text-sm text-gc-blue">{teacher.enrollmentCount ?? 0}</dd>
          </div>
        </dl>
        <span className="gc-btn-gold mt-4 inline-flex w-full justify-center text-sm">
          View profile <span className="gc-btn-arrow">→</span>
        </span>
      </Link>
    </TiltCard>
  );
}
