'use client';

import Link from 'next/link';
import { Heart, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { formatPrice, formatInr, salePrice, cn, formatStartedOn, formatCourseLanguage } from '@/lib/format';
import type { CourseCardData } from '@/lib/types';
import { useCompare } from '@/lib/compare';
import { useAuth } from '@/lib/auth';

export function MarketplaceCourseCard({
  course,
  index = 0,
  onEdit,
  onDelete,
  ctaText = 'Enroll Now',
}: {
  course: CourseCardData;
  index?: number;
  onEdit?: (c: CourseCardData) => void;
  onDelete?: (c: CourseCardData) => void;
  ctaText?: string;
}) {
  const user = useAuth((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const ids = useCompare((s) => s.ids);
  const toggle = useCompare((s) => s.toggle);
  const isCompared = ids.includes(course._id);

  const sale = salePrice(course.price, course.discountPercent, course.pricingType);
  const offerPct = Number(course.discountPercent) || 0;
  const showOffer = offerPct > 0 && sale > 0 && sale < course.price;
  const cover = course.thumbnail?.url;
  const href = `/courses/${course.slug}`;

  const teacher = course.teacherName || course.teachers?.[0]?.name || 'Expert Faculty';

  // Foundation & Language tags (Left side: Basic, Right side: Spanish)
  const foundation = (course.foundation || '').trim() || 'Basic';
  const language = (course.language ? formatCourseLanguage(course.language) : '').trim() || 'Spanish';

  // Started On date
  const started = formatStartedOn(course.startsOn) || "30th Sept'26";
  const targetExam = (course.targetExam || '').trim();

  // Badges: alternate bestseller, new, featured based on course props or index
  const isFree = course.pricingType === 'free';
  const isBestseller = !isFree && (course.featured || (course.enrollmentCount ?? 0) > 100 || index % 4 === 0);
  const isNew = !isFree && !isBestseller && (index % 4 === 1 || Boolean(course.startsOn));

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      {/* Thumbnail Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Link href={href} className="block h-full w-full">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={course.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/courses-hero-student.jpg"
                alt={course.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
        </Link>

        {/* Top-Left Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap items-center gap-1.5 max-w-[70%]">
          {isFree ? (
            <span className="rounded-md bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              Free
            </span>
          ) : targetExam ? (
            <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              {targetExam}
            </span>
          ) : isBestseller ? (
            <span className="rounded-md bg-amber-400 px-2.5 py-0.5 text-[11px] font-bold text-slate-950 shadow-sm">
              Bestseller
            </span>
          ) : isNew ? (
            <span className="rounded-md bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              New
            </span>
          ) : null}
        </div>

        {/* Top-Right: Admin Actions & Heart/Compare Toggle */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {isAdmin && onEdit && (
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => onEdit(course)}
              aria-label="Edit course"
              title="Edit course (Admin)"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-slate-900 hover:text-white"
            >
              <Pencil size={13} />
            </button>
          )}

          {isAdmin && onDelete && (
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => onDelete(course)}
              aria-label="Delete course"
              title="Delete course (Admin)"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm backdrop-blur-md transition hover:bg-red-600 hover:text-white"
            >
              <Trash2 size={13} />
            </button>
          )}

          <button
            suppressHydrationWarning
            type="button"
            onClick={() => toggle(course._id)}
            aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
            title={isCompared ? 'Selected for comparison' : 'Compare course'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-colors shadow-sm',
              isCompared
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-slate-600 hover:bg-white hover:text-rose-500',
            )}
          >
            <Heart size={15} className={cn(isCompared && 'fill-white')} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Left side: Basic & Right side: Spanish (transparent background) */}
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {foundation}
          </span>
          <span className="rounded-full bg-transparent border border-slate-300/80 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            {language}
          </span>
        </div>

        {/* Title */}
        <Link href={href} className="group/title block">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover/title:text-blue-600">
            {course.title}
          </h3>
        </Link>

        {/* Teacher / Faculty Name (Above Started on - round logo removed) */}
        <div className="mt-2 text-xs font-medium text-slate-600 truncate">
          By {teacher}
        </div>

        {/* Started On Date line */}
        <div className="mt-1 text-xs font-medium text-slate-500">
          Started on {started}
        </div>

        {/* Spacer to push footer to bottom */}
        <div className="mt-auto pt-4" />

        {/* Footer: Price & CTA button */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-slate-900">
                {formatPrice(course.price, course.discountPercent, course.pricingType)}
              </span>
              {showOffer && (
                <span className="text-xs text-slate-400 line-through">
                  {formatInr(course.price)}
                </span>
              )}
            </div>
            {showOffer && (
              <span className="text-[11px] font-bold text-emerald-600">
                {Math.round(offerPct)}% off
              </span>
            )}
          </div>

          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <span>{ctaText}</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}
