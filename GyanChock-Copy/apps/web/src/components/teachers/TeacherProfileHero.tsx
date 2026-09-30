'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Award, BookOpen, Star, Users, FlaskConical } from 'lucide-react';
import type { TeacherCardData } from '@/lib/types';

export function TeacherProfileHero({
  teacher,
  onStartLearning,
}: {
  teacher: TeacherCardData;
  onStartLearning?: () => void;
}) {
  const imageUrl =
    teacher.profileImage?.url ||
    teacher.avatar?.url ||
    'https://res.cloudinary.com/giihax3q/image/authenticated/s--ebZ9srgo--/v1789678965/gyan-chowk/cms/d8m3sxxc0seffcmobrt4.jpg';

  const subject = teacher.subject || teacher.subjects?.[0] || 'Faculty';
  const designation = teacher.designation || teacher.specialization || `${subject} Expert`;
  const rating = teacher.stats?.rating ?? teacher.ratingAvg ?? 5.0;
  const reviewCount = teacher.stats?.reviewCount ?? teacher.ratingCount ?? 38;
  const courseCount = teacher.stats?.courseCount ?? teacher.courseCount ?? 0;
  const enrollmentCount = teacher.stats?.enrollmentCount ?? teacher.enrollmentCount ?? 17;

  const tagline =
    teacher.tagline ||
    teacher.bio ||
    `Make ${subject} simple, logical and interesting. Learn with concepts, not just notes.`;

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-[#ECE5D8] bg-[#F7F4EE] p-6 sm:p-8 md:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
      {/* Decorative Warm Ambient Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br from-amber-200/30 to-orange-100/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-gradient-to-tr from-amber-100/40 to-yellow-50/20 blur-2xl" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[320px_1fr] lg:gap-12 items-center">
        {/* LEFT COLUMN: Teacher Portrait Card */}
        <div className="relative mx-auto w-full max-w-[320px]">
          <div className="relative aspect-[4/4.5] w-full overflow-hidden rounded-[2rem] border-4 border-white bg-stone-100 shadow-[0_12px_36px_rgba(40,30,20,0.08)]">
            <Image
              src={imageUrl}
              alt={teacher.name}
              fill
              className="object-cover object-top transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 320px"
              priority
            />

            {/* Subject Pill Badge - Top Right */}
            <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-white/95 px-3 py-1 text-xs font-semibold text-amber-950 shadow-sm backdrop-blur-md">
              <FlaskConical className="h-3.5 w-3.5 text-amber-700" />
              <span>{subject}</span>
            </div>

            {/* Rating Pill Badge - Bottom Left */}
            <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 rounded-full border border-stone-200/60 bg-white/95 px-3.5 py-1.5 text-xs font-medium text-stone-800 shadow-sm backdrop-blur-md">
              <span className="flex items-center text-amber-500 font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 mr-1" />
                {rating.toFixed(1)}
              </span>
              <span className="text-[11px] text-stone-500 font-normal">
                (Based on {reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Teacher Details & Highlights */}
        <div className="flex flex-col justify-center">
          {/* Top row: Kicker + Cursive slogan */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#A67C38]">
              {teacher.featured !== false ? 'FEATURED TEACHER' : 'APPROVED TEACHER'}
            </span>

            <span className="font-serif italic text-lg sm:text-xl text-[#3A332C] opacity-90 select-none">
              Better Learning, Brighter Future
            </span>
          </div>

          {/* Teacher Name */}
          <h1 className="mt-2 font-display text-4xl sm:text-5xl md:text-[3.25rem] font-bold tracking-tight text-[#1F1B18] leading-[1.08]">
            {teacher.name}
          </h1>

          {/* Designation with Trophy/Expert Icon */}
          <div className="mt-2.5 flex items-center gap-2 text-base sm:text-lg font-semibold text-[#8C6228]">
            <Award className="h-5 w-5 text-amber-600 shrink-0" />
            <span>{designation}</span>
          </div>

          {/* Professional Tagline */}
          <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-[#5C544D]">
            {tagline}
          </p>

          {/* 4 Stat Cards Row */}
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Courses */}
            <div className="flex items-center gap-3 rounded-2xl border border-[#EBE4D8] bg-white/90 p-3 sm:p-3.5 shadow-sm transition-all hover:bg-white hover:shadow">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Courses</p>
                <p className="font-display text-lg font-bold text-stone-900">{courseCount}</p>
              </div>
            </div>

            {/* Enrollments */}
            <div className="flex items-center gap-3 rounded-2xl border border-[#EBE4D8] bg-white/90 p-3 sm:p-3.5 shadow-sm transition-all hover:bg-white hover:shadow">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Enrollments</p>
                <p className="font-display text-lg font-bold text-stone-900">{enrollmentCount}</p>
              </div>
            </div>

            {/* Reviews */}
            <div className="flex items-center gap-3 rounded-2xl border border-[#EBE4D8] bg-white/90 p-3 sm:p-3.5 shadow-sm transition-all hover:bg-white hover:shadow">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Reviews</p>
                <p className="font-display text-lg font-bold text-stone-900">{reviewCount}</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 rounded-2xl border border-[#EBE4D8] bg-white/90 p-3 sm:p-3.5 shadow-sm transition-all hover:bg-white hover:shadow">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-500" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">Rating</p>
                <p className="font-display text-lg font-bold text-stone-900">{rating.toFixed(1)}</p>
              </div>
            </div>
          </div>

          {/* CTA: Start Learning */}
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="#teacher-courses"
              onClick={onStartLearning}
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#1C1815] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#342D27] hover:shadow-lg active:scale-[0.98]"
            >
              <span>Start Learning</span>
              <span className="text-base leading-none">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
