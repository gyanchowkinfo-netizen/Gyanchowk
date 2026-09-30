'use client';

import React from 'react';
import Image from 'next/image';
import type { CareerLifeConfig } from '@/lib/types';

interface LifeAtGyanChowkProps {
  config: CareerLifeConfig;
}

export function LifeAtGyanChowk({ config }: LifeAtGyanChowkProps) {
  if (!config || config.active === false) return null;

  const activeCards = config.cards
    ? config.cards.filter((c) => c.active).sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  return (
    <section className="py-16 sm:py-20 bg-[#FAF7F2] border-b border-[#ECE6DE] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-4 h-px bg-[#C4A05A]/50" aria-hidden="true" />
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#8C6228]">
              {config.eyebrow || 'LIFE AT GYAN CHOWK'}
            </span>
            <span className="w-4 h-px bg-[#C4A05A]/50" aria-hidden="true" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-normal sm:font-medium text-slate-900 tracking-tight">
            {config.heading || 'Learn. Grow. Belong.'}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed font-normal">
            {config.description ||
              'From flexible work culture to continuous learning, we make sure you have everything you need to do your best work.'}
          </p>
        </div>

        {/* 4 Cards Grid - Note: Icons removed from cards as requested */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeCards.map((card) => (
            <div
              key={card.id}
              className="group bg-white rounded-3xl overflow-hidden border border-[#ECE6DE] hover:border-amber-300 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Image Container without floating icon badge */}
              <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                <Image
                  src={card.imageUrl || '/career-life-1.jpg'}
                  alt={card.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Text Body */}
              <div className="p-6 space-y-2 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
