'use client';

import React from 'react';
import { ArrowRight, Bookmark, ShieldCheck, CreditCard, Zap, Play } from 'lucide-react';
import { formatPrice, salePrice, formatInr } from '@/lib/format';
import type { CourseDetail } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CoursePricingCardProps {
  course: CourseDetail;
  onEnroll: () => void;
  onSaveWishlist: () => void;
  onWatchPreview?: () => void;
  saving?: boolean;
  hasDemoVideo?: boolean;
  className?: string;
  isSticky?: boolean;
}

export function CoursePricingCard({
  course,
  onEnroll,
  onSaveWishlist,
  onWatchPreview,
  saving = false,
  hasDemoVideo = false,
  className,
  isSticky = false,
}: CoursePricingCardProps) {
  const priceFormatted = formatPrice(course.price, course.discountPercent, course.pricingType);
  const discountPercent = course.discountPercent || 0;
  const originalPrice =
    course.comparePrice && course.comparePrice > course.price
      ? course.comparePrice
      : discountPercent > 0
      ? salePrice(course.price, 0, course.pricingType)
      : 0;

  const validityDays = course.validityDays ?? 365;

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-900/5 transition',
        isSticky && 'lg:sticky lg:top-24',
        className,
      )}
    >
      {/* Price header with Discount Badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {priceFormatted}
            </span>
            {originalPrice > 0 && discountPercent > 0 && (
              <span className="text-base font-semibold text-slate-400 line-through">
                {formatInr(originalPrice)}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Valid for {validityDays} days
          </p>
        </div>

        {discountPercent > 0 && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/80">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="mt-6 space-y-2.5">
        <button
          type="button"
          onClick={onEnroll}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-center text-sm font-bold text-slate-950 shadow-sm transition hover:bg-amber-500 active:scale-[0.99]"
        >
          <span>Enroll Now</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>

        <button
          type="button"
          onClick={onSaveWishlist}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-center text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 active:scale-[0.99] disabled:opacity-50"
        >
          <Bookmark className="h-3.5 w-3.5 text-slate-500" />
          <span>{saving ? 'Saving…' : 'Save for Later'}</span>
        </button>

        {hasDemoVideo && onWatchPreview && (
          <button
            type="button"
            onClick={onWatchPreview}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50/70 px-4 py-2 text-center text-xs font-semibold text-amber-900 transition hover:bg-amber-100/80"
          >
            <Play className="h-3.5 w-3.5 fill-amber-700 text-amber-700" />
            <span>Watch Demo Preview</span>
          </button>
        )}
      </div>

      {/* Trust & Guarantee */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Secure payment with 256-bit SSL encryption</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-slate-400" />
            EMI Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Instant Access
          </span>
        </div>
      </div>
    </div>
  );
}
