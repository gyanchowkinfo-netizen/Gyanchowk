'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { CourseCardData } from '@/lib/types';
import { formatPrice, formatInr, salePrice } from '@/lib/format';

export function PromoCourse({ course }: { course?: CourseCardData }) {
  if (!course) return null;
  const sale = salePrice(course.price, course.discountPercent, course.pricingType);
  const showStrike = Boolean(course.discountPercent) && sale > 0 && sale < course.price;
  const teacher = course.teachers?.[0]?.name;

  return (
    <section className="gc-container pb-6" aria-labelledby="promo-course">
      <Link
        href={`/courses/${course.slug}`}
        className="group relative grid overflow-hidden rounded-[24px] border border-gc-line bg-[color:var(--brand-navy)] text-white md:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="relative z-10 p-6 sm:p-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/60">Highlighted programme</p>
          <h2 id="promo-course" className="mt-3 max-w-lg font-display text-3xl leading-tight sm:text-4xl">
            {course.title}
          </h2>
          {course.subtitle ? <p className="mt-3 max-w-md text-sm text-white/75">{course.subtitle}</p> : null}
          <p className="mt-4 text-sm text-white/70">
            {[course.targetExam || course.category, teacher].filter(Boolean).join(' · ')}
          </p>
          <p className="mt-6 font-display text-2xl">
            {formatPrice(course.price, course.discountPercent, course.pricingType)}
            {showStrike ? <span className="ml-2 text-sm text-white/50 line-through">{formatInr(course.price)}</span> : null}
          </p>
          <span className="mt-6 inline-flex items-center gap-1 text-sm text-white">
            Explore course <ArrowUpRight className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={16} />
          </span>
        </div>
        <div className="relative min-h-[180px] md:min-h-full">
          {course.thumbnail?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnail.url} alt="" className="h-full w-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="h-full min-h-[180px] bg-[image:var(--gradient-hero)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[color:var(--brand-navy)]/40 md:bg-gradient-to-l" />
        </div>
      </Link>
    </section>
  );
}
