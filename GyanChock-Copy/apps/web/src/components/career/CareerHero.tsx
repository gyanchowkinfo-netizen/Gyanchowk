'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, GraduationCap, Users, Heart, Sparkles } from 'lucide-react';
import type { CareerHeroConfig } from '@/lib/types';

interface CareerHeroProps {
  hero: CareerHeroConfig;
}

export function CareerHero({ hero }: CareerHeroProps) {
  if (!hero || hero.active === false) return null;

  const scrollToJobs = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hero.ctaLink?.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(hero.ctaLink);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getBenefitIcon = (icon: string) => {
    switch (icon.toLowerCase()) {
      case 'users':
      case 'growth':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'heart':
      case 'culture':
        return <Heart className="w-4 h-4 text-purple-600 fill-purple-600/20" />;
      case 'graduation-cap':
      case 'meaningful':
      default:
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf9f4] via-[#f7f5ed] to-[#f4f1e6] border-b border-slate-200/70 pt-12 pb-16 lg:pt-16 lg:pb-24">
      {/* Subtle ambient warm circles matching About hero */}
      <div className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-amber-200/25 blur-3xl -z-10" aria-hidden />
      <div className="pointer-events-none absolute top-1/2 left-10 h-72 w-72 rounded-full bg-blue-200/20 blur-3xl -z-10" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">
            {/* Eyebrow Badge */}
            {hero.badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/90 border border-amber-200/70 text-amber-900 text-xs font-semibold tracking-wider uppercase shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                <span>{hero.badge}</span>
              </div>
            )}

            {/* Main Heading with signature Gyan Chowk font-display */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.65rem] font-medium leading-[1.1] tracking-tight text-slate-900 whitespace-pre-line">
              {hero.heading}
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              {hero.description}
            </p>

            {/* Benefit Items */}
            {hero.benefits && hero.benefits.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
                {hero.benefits
                  .filter((b) => b.active)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#ECE6DE] text-slate-800 text-xs sm:text-sm font-medium shadow-2xs"
                    >
                      {getBenefitIcon(b.icon)}
                      <span>{b.text}</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Primary CTA */}
            <div className="pt-2">
              <a
                href={hero.ctaLink || '#open-positions'}
                onClick={scrollToJobs}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#0c1a30] hover:bg-[#152a4e] text-white text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{hero.ctaText || 'Explore Open Positions'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Right Column: Hero Image with decorative elements matching About hero */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-lg">
              {/* Organic backdrop glow matching About hero */}
              <div
                className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-amber-200/50 via-orange-100/30 to-blue-100/50 blur-xl opacity-70"
                aria-hidden
              />
              
              {/* Floating badge */}
              <div className="absolute -top-3 -right-2 sm:right-2 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-xs border border-amber-200/70 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px] sm:text-xs font-bold text-slate-800 tracking-tight">
                  Better Learning, Brighter Future
                </span>
              </div>

              {/* Main Image Container matching About hero */}
              <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-b from-amber-50/70 via-slate-50 to-slate-100 shadow-2xl">
                <Image
                  src={hero.imageUrl || '/career-hero.jpg'}
                  alt={hero.imageAlt || 'Careers at Gyan Chowk'}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 512px"
                  priority
                  className="object-cover object-center"
                />
                {/* Soft overlay gradient */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
