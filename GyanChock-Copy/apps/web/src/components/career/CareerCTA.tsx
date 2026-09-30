'use client';

import React from 'react';
import { Send, ArrowRight } from 'lucide-react';
import type { CareerCTAConfig } from '@/lib/types';

interface CareerCTAProps {
  config: CareerCTAConfig;
}

export function CareerCTA({ config }: CareerCTAProps) {
  if (!config || config.active === false) return null;

  const scrollToPositions = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (config.buttonLink?.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(config.buttonLink);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0c1a30] px-6 py-10 sm:px-12 sm:py-12 shadow-xl border border-slate-800">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            {/* Left Content */}
            <div className="flex items-center gap-5 sm:gap-6 text-left">
              {/* Airplane / Send Icon */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Send className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              </div>

              {/* Text */}
              <div className="space-y-1 sm:space-y-1.5">
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal sm:font-medium text-white tracking-tight">
                  {config.heading || 'Ready to Build Your Future With Us?'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
                  {config.description ||
                    'Join Gyan Chowk and be a part of our mission to make quality education accessible to everyone.'}
                </p>
              </div>
            </div>

            {/* Right Button */}
            <div className="shrink-0 w-full sm:w-auto flex justify-start sm:justify-end">
              <a
                href={config.buttonLink || '#open-positions'}
                onClick={scrollToPositions}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-950/40 hover:shadow-blue-950/60 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{config.buttonText || 'View Open Positions'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
