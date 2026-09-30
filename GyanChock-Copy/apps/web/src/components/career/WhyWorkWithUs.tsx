'use client';

import React from 'react';
import { Rocket, TrendingUp, Users, Lightbulb, Star, Shield, Award, Heart } from 'lucide-react';
import { Reveal } from '@/components/motion';
import type { CareerWhyConfig } from '@/lib/types';

interface WhyWorkWithUsProps {
  config: CareerWhyConfig;
}

export function WhyWorkWithUs({ config }: WhyWorkWithUsProps) {
  if (!config || config.active === false) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'rocket':
        return <Rocket className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />;
      case 'trending-up':
      case 'chart':
        return <TrendingUp className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />;
      case 'users':
      case 'team':
        return <Users className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />;
      case 'lightbulb':
      case 'innovation':
        return <Lightbulb className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />;
      case 'star':
      case 'award':
        return <Star className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />;
      case 'shield':
        return <Shield className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />;
      case 'heart':
        return <Heart className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />;
      default:
        return <Award className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />;
    }
  };

  const activeCards = config.cards
    ? config.cards.filter((c) => c.active).sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F2] border-b border-[#ECE6DE] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[450px] bg-gradient-to-r from-amber-200/10 via-sky-100/15 to-blue-200/10 blur-3xl rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="w-5 h-px bg-[#C4A05A]/50" aria-hidden="true" />
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#8C6228]">
                {config.eyebrow || 'WHY WORK WITH US'}
              </span>
              <span className="w-5 h-px bg-[#C4A05A]/50" aria-hidden="true" />
            </div>
          </Reveal>

          <Reveal delay={0.04}>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-normal sm:font-medium text-slate-900 tracking-tight leading-[1.14]">
              {config.heading || 'More Than Just a Job'}
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              {config.description ||
                "We believe in people, purpose, and progress. Here's why you'll love being a part of Gyan Chowk."}
            </p>
          </Reveal>
        </div>

        {/* 5 Premium Cards Row / Grid with Equal Heights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6 auto-rows-fr">
          {activeCards.map((card, idx) => (
            <Reveal key={card.id} delay={idx * 0.05} className="h-full flex flex-col">
              <div
                tabIndex={0}
                className="group relative h-full w-full rounded-[24px] border border-[#E7E2D6] bg-gradient-to-b from-white via-white to-[#FDFCFB] p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_35px_-8px_rgba(15,23,42,0.08)] hover:border-blue-400/70 transition-all duration-300 ease-out hover:-translate-y-2 overflow-hidden flex flex-col items-center text-center justify-between flex-1 cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
              >
                {/* Subtle top ambient glow on hover */}
                <div className="pointer-events-none absolute -top-10 inset-x-8 h-16 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" />

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center flex-1 w-full">
                  {/* Premium Squircle Icon Container */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50/90 to-sky-100/70 border border-blue-100/90 flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:border-transparent group-hover:shadow-md">
                    {renderIcon(card.icon)}
                  </div>

                  {/* Title with signature font-display */}
                  <h3 className="font-display font-bold text-[1.125rem] sm:text-[1.2rem] text-slate-900 group-hover:text-blue-700 transition-colors tracking-tight leading-snug mt-5 mb-2.5">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-[13.5px] text-[#475569] font-normal leading-relaxed flex-1">
                    {card.description}
                  </p>
                </div>

                {/* Bottom decorative accent pill */}
                <div className="relative z-10 mt-6 w-8 h-1 rounded-full bg-slate-200 group-hover:bg-blue-600 transition-all duration-300 group-hover:w-14" />

                {/* Bottom soft gradient reflection */}
                <div className="pointer-events-none absolute -bottom-6 inset-x-4 h-12 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
