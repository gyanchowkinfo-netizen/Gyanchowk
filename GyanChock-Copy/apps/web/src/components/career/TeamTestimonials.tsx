'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CareerTestimonialsConfig } from '@/lib/types';

interface TeamTestimonialsProps {
  config: CareerTestimonialsConfig;
}

export function TeamTestimonials({ config }: TeamTestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const activeItems = config.items
    ? config.items.filter((item) => item.active).sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const total = activeItems.length;

  const nextSlide = () => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  if (!config || config.active === false || total === 0) return null;

  const current = activeItems[currentIndex];

  return (
    <section className="py-16 sm:py-20 bg-[#F8F6F0] border-b border-[#ECE6DE] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-4 h-px bg-[#C4A05A]/50" aria-hidden="true" />
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#8C6228]">
              {config.eyebrow || 'WHAT OUR TEAM SAYS'}
            </span>
            <span className="w-4 h-px bg-[#C4A05A]/50" aria-hidden="true" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-normal sm:font-medium text-slate-900 tracking-tight">
            {config.heading || 'Real People. Real Stories.'}
          </h2>
        </div>

        {/* Testimonial Card */}
        <div
          className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#ECE6DE] shadow-sm hover:shadow-md transition-shadow relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Avatar Photo */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-amber-50 shadow-md shrink-0 bg-slate-100">
              <Image
                src={current.photoUrl || '/career-testimonial-1.jpg'}
                alt={current.name}
                fill
                sizes="112px"
                className="object-cover object-center"
              />
            </div>

            {/* Testimonial Content & Controls */}
            <div className="flex-1 space-y-5 text-center sm:text-left">
              {/* Quote with font-display */}
              <p className="font-display text-base sm:text-xl text-slate-800 leading-relaxed font-normal italic">
                &ldquo;{current.quote}&rdquo;
              </p>

              {/* Author & Designation + Arrows */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#ECE6DE]">
                <div>
                  <h3 className="font-display font-medium text-base sm:text-lg text-slate-900">{current.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">{current.designation}</p>
                </div>

                {/* Prev / Next controls */}
                {total > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={prevSlide}
                      className="w-10 h-10 rounded-full border border-slate-200 hover:border-amber-400 hover:text-amber-800 text-slate-600 flex items-center justify-center transition-colors shadow-xs"
                      aria-label="Previous testimonial"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      className="w-10 h-10 rounded-full border border-slate-200 hover:border-amber-400 hover:text-amber-800 text-slate-600 flex items-center justify-center transition-colors shadow-xs"
                      aria-label="Next testimonial"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination Dots */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {activeItems.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-6 h-2 bg-[#8C6228]'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
