'use client';

import Link from 'next/link';
import { formatPrice, formatInr, salePrice, cn } from '@/lib/format';
import { Rating } from '@/components/ui/Badge';
import type { CourseCardData } from '@/lib/types';
import { useCompare } from '@/lib/compare';
import { StaggerContainer, StaggerItem } from '@/components/motion';

export function CourseCard({
  course,
  compare,
  featured,
  variant = 'default',
}: {
  course: CourseCardData;
  compare?: boolean;
  featured?: boolean;
  variant?: 'default' | 'catalog';
}) {
  const ids = useCompare((s) => s.ids);
  const toggle = useCompare((s) => s.toggle);
  const selected = ids.includes(course._id);
  const teachers = (course.teachers ?? []).map((t) => t.name).filter(Boolean).join(', ');
  const meta = [course.targetExam, course.category, course.language].filter(Boolean).join(' · ');
  const sale = salePrice(course.price, course.discountPercent, course.pricingType);
  const offerPct = Number(course.discountPercent) || 0;
  const showOffer = offerPct > 0 && sale > 0 && sale < course.price;
  const cover = course.thumbnail?.url;
  const href = `/courses/${course.slug}`;
  const isCatalog = variant === 'catalog';

  const cardInner = (
    <>
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-blue)]/40">
        <div className="gc-course-media" aria-hidden={!cover}>
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" />
          ) : null}
          {course.pricingType === 'free' ? <span className="gc-course-badge">Free</span> : null}
        </div>
      </Link>
      <div className={cn('gc-course-body', featured && 'sm:pt-6')}>
        <Link href={href} className="group/title block focus-visible:outline-none">
          <h3
            className={cn(
              'gc-course-title',
              isCatalog && 'gc-course-title--catalog group-hover/title:text-[color:var(--brand-navy)]',
            )}
          >
            {course.title}
          </h3>
        </Link>
        {meta ? <p className="mt-1.5 text-xs tracking-wide text-gc-mute">{meta}</p> : null}
        <p className="mt-2 text-sm font-medium text-gc-mist">{teachers || 'Faculty TBA'}</p>
        {course.subtitle ? (
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-gc-mute">{course.subtitle}</p>
        ) : (
          <span className="flex-1" />
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {course.ratingCount ? (
            <Rating value={course.ratingAvg} count={course.ratingCount} />
          ) : (
            <span className="text-xs text-gc-mute">Ratings after course reviews</span>
          )}
          {course.enrollmentCount != null ? (
            <span className="text-xs font-medium text-gc-mist">{course.enrollmentCount} enrolled</span>
          ) : null}
        </div>
        <div className={cn('gc-course-foot', isCatalog && 'gc-course-foot--catalog')}>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className={cn(isCatalog ? 'gc-course-price-chip' : 'gc-course-price block')}>
              {formatPrice(course.price, course.discountPercent, course.pricingType)}
              {isCatalog && showOffer ? <s>{formatInr(course.price)}</s> : null}
            </span>
            {isCatalog && showOffer ? <span className="gc-course-offer">{Math.round(offerPct)}% off</span> : null}
          </div>
          {isCatalog ? (
            <Link href={href} className="gc-btn-primary gc-course-cta shrink-0">
              View course
              <span className="gc-btn-arrow" aria-hidden>
                →
              </span>
            </Link>
          ) : (
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-sm font-medium text-gc-mute transition-colors hover:text-gc-black"
            >
              View course
              <span className="gc-btn-arrow" aria-hidden>
                →
              </span>
            </Link>
          )}
        </div>
      </div>
    </>
  );

  return (
    <article className="h-full">
      <div
        className={cn(
          'gc-card gc-card-lift gc-course-card group relative flex h-full flex-col',
          isCatalog && 'gc-course-card--catalog',
        )}
      >
        {cardInner}
      </div>
      {compare ? (
        <button
          type="button"
          className="mt-3 text-left text-xs text-gc-blue"
          aria-pressed={selected}
          onClick={() => toggle(course._id)}
        >
          {selected ? 'Remove from compare' : 'Add to compare'}
        </button>
      ) : null}
    </article>
  );
}

export function CourseGrid({
  courses,
  compare,
  featured,
  variant,
}: {
  courses: CourseCardData[];
  compare?: boolean;
  featured?: boolean;
  variant?: 'default' | 'catalog';
}) {
  return (
    <StaggerContainer className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((c) => (
        <StaggerItem key={c._id} className="h-full">
          <CourseCard course={c} compare={compare} featured={featured} variant={variant} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
