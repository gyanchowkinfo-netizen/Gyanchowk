'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { CourseDetail } from '@/lib/types';
import { formatPrice } from '@/lib/format';

interface CourseFinalCTAProps {
  course: CourseDetail;
  onEnroll: () => void;
}

export function CourseFinalCTA({ course, onEnroll }: CourseFinalCTAProps) {
  const ctaData = course.finalCta;
  if (ctaData?.enabled === false) return null;

  const title = ctaData?.title || 'Ready to start learning?';
  const subtitle =
    ctaData?.subtitle ||
    'Join thousands of learners achieving excellence with expert guidance and proven course frameworks.';
  const buttonText = ctaData?.buttonText || 'Enroll Now';
  const priceFormatted = formatPrice(course.price, course.discountPercent, course.pricingType);

  return (
    <section id="cta" className="scroll-mt-28 mt-12 mb-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Limited Enrollment Open
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <div className="text-center sm:text-right hidden lg:block">
              <span className="text-xs text-slate-400 block">Total Investment</span>
              <span className="text-2xl font-bold text-amber-400">{priceFormatted}</span>
            </div>

            <button
              type="button"
              onClick={onEnroll}
              className="group flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-md transition hover:bg-amber-300 active:scale-95"
            >
              <span>{buttonText}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
