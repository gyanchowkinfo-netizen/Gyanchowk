'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play,
  Video,
  Clock,
  Users,
  Award,
  Crown,
  ChevronRight,
  HelpCircle,
  Radio,
  BookOpen,
} from 'lucide-react';
import type { CourseDetail } from '@/lib/types';
import { CoursePricingCard } from './CoursePricingCard';

interface CourseDetailHeroProps {
  course: CourseDetail;
  onEnroll: () => void;
  onSaveWishlist: () => void;
  onWatchPreview?: () => void;
  saving?: boolean;
  hasDemoVideo?: boolean;
}

export function CourseDetailHero({
  course,
  onEnroll,
  onSaveWishlist,
  onWatchPreview,
  saving = false,
  hasDemoVideo = false,
}: CourseDetailHeroProps) {
  // Banner / Thumbnail resolution
  const bannerUrl =
    course.banner?.url ||
    course.thumbnail?.url ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80';

  // Highlights resolution (dynamic with defaults, mapping legacy items to Study Material)
  const rawHighlights = course.highlights?.length
    ? course.highlights
    : [
        {
          title: 'Study Material',
          subtitle: 'Comprehensive Notes',
          icon: 'book',
        },
        {
          title: 'Recorded Lectures',
          subtitle: 'Watch Anytime',
          icon: 'play',
        },
        {
          title: 'Doubt Support',
          subtitle: '24/7 Help',
          icon: 'help',
        },
      ];

  const highlights = rawHighlights.map((h) => {
    if (
      h.title === 'Recorded Class' ||
      h.subtitle === 'Interactive Sessions' ||
      (h.title === 'Live Classes' && h.subtitle === 'Interactive Sessions')
    ) {
      return {
        ...h,
        title: 'Study Material',
        subtitle: 'Comprehensive Notes',
        icon: 'book',
      };
    }
    return h;
  });

  // Statistics resolution
  const duration = course.duration || '12 Months';
  const enrolled =
    course.enrollmentCount && course.enrollmentCount > 0
      ? `${course.enrollmentCount.toLocaleString()}+`
      : '25,482+';
  const level = course.level || 'Advanced';

  return (
    <section className="bg-gradient-to-b from-amber-50/40 via-slate-50/50 to-white pb-8 pt-4 sm:pt-6 border-b border-slate-200/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-1 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link href="/courses" className="hover:text-slate-900 transition-colors">
            Courses
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 line-clamp-1 max-w-[240px] sm:max-w-md">
            {course.title}
          </span>
        </nav>

        {/* Hero Main Grid */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Course Banner / Visual */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-950 shadow-md aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] w-full">
              <Image
                src={bannerUrl}
                alt={course.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 420px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Dark subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              {/* Floating Badge: Live + Recorded */}
              <div className="absolute right-3.5 top-3.5 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-md border border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                  Live + Recorded
                </span>
              </div>

              {/* Bottom Left CTA: Watch Demo */}
              <div className="absolute bottom-3.5 left-3.5 z-10">
                {hasDemoVideo && onWatchPreview ? (
                  <button
                    type="button"
                    onClick={onWatchPreview}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-bold text-white shadow-md backdrop-blur-md transition hover:bg-slate-900 border border-white/20 active:scale-95"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950">
                      <Play className="h-2.5 w-2.5 fill-slate-950 ml-0.5" />
                    </span>
                    <span>Watch Demo</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/15">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400/90 text-slate-950">
                      <Radio className="h-2.5 w-2.5 text-slate-950" />
                    </span>
                    <span>Course Preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column: Title, Subtitle, Description, Highlights & Stats */}
          <div className="lg:col-span-7 xl:col-span-5 flex flex-col">
            {/* Category / Badge */}
            <div className="mb-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300/80 shadow-xs">
                <Crown className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
                <span>{course.badge || 'Premium Course'}</span>
              </span>
              {course.category && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 capitalize">
                  {course.category}
                </span>
              )}
            </div>

            {/* Course Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {course.title}
            </h1>

            {/* Subtitle */}
            <p className="mt-2 text-base font-semibold text-slate-700">
              {course.subtitle || 'Complete Preparation Program'}
            </p>

            {/* Short Description */}
            <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-3">
              {course.description ||
                'Concept clarity, expert guidance and rigorous practice to help you master this curriculum with confidence.'}
            </p>

            {/* Highlights Row */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-2.5 shadow-2xs backdrop-blur-xs"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
                    {h.icon === 'book' || h.title?.toLowerCase().includes('study') ? (
                      <BookOpen className="h-4 w-4" />
                    ) : h.icon === 'play' || h.title?.toLowerCase().includes('recorded') ? (
                      <Play className="h-4 w-4 fill-amber-600" />
                    ) : h.icon === 'help' || h.title?.toLowerCase().includes('doubt') ? (
                      <HelpCircle className="h-4 w-4" />
                    ) : (
                      <Video className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{h.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{h.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Statistics Row */}
            <div className="mt-5 flex flex-wrap items-center gap-6 rounded-xl border border-slate-200/70 bg-white/60 px-4 py-3 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <div>
                  <span className="text-[11px] text-slate-500 block leading-none">Duration</span>
                  <span className="font-bold text-slate-900">{duration}</span>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="text-[11px] text-slate-500 block leading-none">Students Enrolled</span>
                  <span className="font-bold text-slate-900">{enrolled}</span>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" />
                <div>
                  <span className="text-[11px] text-slate-500 block leading-none">Level</span>
                  <span className="font-bold text-slate-900">{level}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Card (Desktop layout) */}
          <div className="lg:col-span-12 xl:col-span-3 mt-4 xl:mt-0">
            <CoursePricingCard
              course={course}
              onEnroll={onEnroll}
              onSaveWishlist={onSaveWishlist}
              onWatchPreview={onWatchPreview}
              saving={saving}
              hasDemoVideo={hasDemoVideo}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
