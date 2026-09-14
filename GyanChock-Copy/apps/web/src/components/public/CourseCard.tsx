'use client';

import Link from 'next/link';
import { formatPrice, cn } from '@/lib/format';
import { Rating, Badge } from '@/components/ui/Badge';
import type { CourseCardData } from '@/lib/types';
import { useCompare } from '@/lib/compare';
import { StaggerContainer, StaggerItem, TiltCard } from '@/components/motion';

export function CourseCard({ course, compare, featured }: { course: CourseCardData; compare?: boolean; featured?: boolean }) {
  const ids = useCompare((s) => s.ids);
  const toggle = useCompare((s) => s.toggle);
  const selected = ids.includes(course._id);
  const teachers = (course.teachers ?? []).map((t) => t.name).filter(Boolean).join(', ');
  const meta = [course.targetExam, course.category, course.language].filter(Boolean).join(' · ');

  return (
    <TiltCard intensity={5} className="h-full">
      <article className="h-full">
        <Link
          href={`/courses/${course.slug}`}
          className={cn(
            'gc-card group relative flex h-full flex-col overflow-hidden hover:border-gc-gold',
            featured ? 'p-0' : 'p-0',
          )}
        >
          <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gc-blue/25 to-gc-navy">
            {course.thumbnail?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.thumbnail.url}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            ) : null}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gc-ink/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="absolute left-3 top-3">
              <Badge className="bg-white/90 uppercase tracking-widest text-gc-blue">{course.pricingType}</Badge>
            </span>
          </div>
          <div className={cn('flex flex-1 flex-col p-5', featured && 'p-6')}>
            <h3 className={cn('font-display group-hover:text-gc-gold', featured ? 'text-2xl' : 'text-xl')}>{course.title}</h3>
            {meta ? <p className="mt-1 text-xs text-gc-mute">{meta}</p> : null}
            {teachers ? <p className="mt-2 text-sm text-gc-mist">{teachers}</p> : <p className="mt-2 text-sm text-gc-mute">Faculty TBA</p>}
            <p className="mt-2 line-clamp-2 flex-1 text-sm text-gc-mute">{course.subtitle}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              {course.ratingCount ? (
                <Rating value={course.ratingAvg} count={course.ratingCount} />
              ) : (
                <span className="text-xs text-gc-mute">Ratings after course reviews</span>
              )}
              {course.enrollmentCount != null ? (
                <span className="text-xs text-gc-mute">{course.enrollmentCount} enrolled</span>
              ) : null}
            </div>
            <div className="mt-4 flex items-end justify-between gap-2">
              <p>
                <span className="font-display text-lg text-gc-gold">{formatPrice(course.price, course.discountPercent, course.pricingType)}</span>
              </p>
              <span className="gc-btn-gold px-3 py-1.5 text-xs">
                View course <span className="gc-btn-arrow">→</span>
              </span>
            </div>
          </div>
        </Link>
        {compare ? (
          <button
            type="button"
            className="mt-3 text-left text-xs text-gc-glow"
            aria-pressed={selected}
            onClick={() => toggle(course._id)}
          >
            {selected ? 'Remove from compare' : 'Add to compare'}
          </button>
        ) : null}
      </article>
    </TiltCard>
  );
}

export function CourseGrid({ courses, compare, featured }: { courses: CourseCardData[]; compare?: boolean; featured?: boolean }) {
  return (
    <StaggerContainer className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((c) => (
        <StaggerItem key={c._id} className="h-full">
          <CourseCard course={c} compare={compare} featured={featured} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
