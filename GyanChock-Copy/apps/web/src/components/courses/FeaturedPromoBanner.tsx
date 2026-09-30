'use client';

import {
  Sparkles,
  ArrowRight,
  Laptop,
  Award,
  RotateCcw,
  CheckCircle2,
  Star,
  Edit3,
} from 'lucide-react';
import { CoursesFeaturedPromoConfig, DEFAULT_COURSES_PAGE_CONFIG } from '@/lib/types';

function renderBenefitIcon(icon?: string) {
  switch (icon) {
    case 'award':
      return <Award size={17} />;
    case 'rotate':
      return <RotateCcw size={17} />;
    case 'check':
      return <CheckCircle2 size={17} />;
    case 'star':
      return <Star size={17} />;
    case 'sparkles':
      return <Sparkles size={17} />;
    case 'laptop':
    default:
      return <Laptop size={17} />;
  }
}

function renderBenefitBg(icon?: string) {
  switch (icon) {
    case 'award':
      return 'bg-indigo-100 text-indigo-700';
    case 'rotate':
      return 'bg-cyan-100 text-cyan-700';
    case 'check':
      return 'bg-emerald-100 text-emerald-700';
    case 'star':
      return 'bg-amber-100 text-amber-700';
    case 'sparkles':
      return 'bg-purple-100 text-purple-700';
    case 'laptop':
    default:
      return 'bg-blue-100 text-blue-700';
  }
}

export function FeaturedPromoBanner({
  config,
  onExplore,
  onEdit,
}: {
  config?: CoursesFeaturedPromoConfig;
  onExplore?: () => void;
  onEdit?: () => void;
}) {
  const promo = {
    ...DEFAULT_COURSES_PAGE_CONFIG.featuredPromo,
    ...(config || {}),
  };

  const activeBenefits = (
    promo.benefits || DEFAULT_COURSES_PAGE_CONFIG.featuredPromo.benefits
  ).filter((b) => b.active !== false);

  const handleCtaClick = () => {
    if (promo.ctaLink) {
      if (promo.ctaLink.startsWith('#')) {
        const id = promo.ctaLink.slice(1);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      window.location.href = promo.ctaLink;
      return;
    }
    if (onExplore) {
      onExplore();
    }
  };

  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-blue-100/90 bg-gradient-to-br from-[#eff6ff] via-[#f2f8fe] to-[#e4f2fe] p-6 sm:p-8 shadow-sm">
      {/* Subtle background ambient circles */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-blue-200/30 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-amber-100/40 blur-2xl"
        aria-hidden
      />

      <div className="relative grid items-center gap-6 lg:grid-cols-[1.2fr_1fr_auto] lg:gap-8">
        {/* Left Column: Heading, description & CTA */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 border border-amber-200/70 px-3 py-0.5 text-[11px] font-bold tracking-wider text-amber-900 uppercase">
              <Sparkles size={13} className="text-amber-600 fill-amber-500" />
              {promo.badge || 'FEATURED'}
            </div>

            {onEdit && (
              <button
                suppressHydrationWarning
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white/90 px-3 py-0.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm hover:bg-blue-50 transition"
              >
                <Edit3 size={12} className="text-blue-600" />
                <span>Edit Section</span>
              </button>
            )}
          </div>

          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            {promo.title}
          </h2>

          <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
            {promo.subtitle}
          </p>

          <div className="mt-5">
            <button
              suppressHydrationWarning
              type="button"
              onClick={handleCtaClick}
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <span>{promo.ctaText || 'Explore Featured Courses'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Middle Column: Benefit Badges */}
        <div className="flex flex-col gap-3.5">
          {activeBenefits.map((benefit, idx) => (
            <div
              key={benefit._key || idx}
              className="flex items-center gap-3 rounded-2xl bg-white/70 p-2.5 backdrop-blur-sm border border-white/60"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${renderBenefitBg(
                  benefit.icon,
                )}`}
              >
                {renderBenefitIcon(benefit.icon)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{benefit.title}</p>
                <p className="text-[11px] text-slate-500">{benefit.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: 3D Graduation Cap & Books Graphic */}
        <div className="hidden lg:flex shrink-0 items-center justify-center">
          <div className="relative h-40 w-40 overflow-hidden rounded-2xl bg-white/40 p-2 shadow-inner border border-white/80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={promo.imageUrl || '/courses-featured-cap.jpg'}
              alt={promo.imageAlt || 'Graduation Cap and Books'}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
