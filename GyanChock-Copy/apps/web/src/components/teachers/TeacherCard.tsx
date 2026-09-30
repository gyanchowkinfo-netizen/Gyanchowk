'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShieldCheck, BookOpen, Users, MapPin, Briefcase } from 'lucide-react';
import type { TeacherCardData } from '@/lib/types';

export function TeacherCard({ teacher }: { teacher: TeacherCardData }) {
  const slug = teacher.slug || teacher._id;
  const href = `/teachers/${slug}`;
  const imageUrl =
    teacher.profileImage?.url ||
    teacher.avatar?.url ||
    'https://res.cloudinary.com/giihax3q/image/authenticated/s--ebZ9srgo--/v1789678965/gyan-chowk/cms/d8m3sxxc0seffcmobrt4.jpg';

  const subject = teacher.subject || teacher.subjects?.[0] || teacher.categories?.[0] || 'Educator';
  const specialization = teacher.specialization || teacher.designation || teacher.headline || `${subject} Expert`;
  const rating = teacher.stats?.rating ?? teacher.ratingAvg ?? 5.0;
  const reviews = teacher.stats?.reviewCount ?? teacher.ratingCount ?? 38;
  const enrollments = teacher.stats?.enrollmentCount ?? teacher.enrollmentCount ?? 17;
  const courses = teacher.stats?.courseCount ?? teacher.courseCount ?? 0;
  const experience = teacher.experience || '5+ Years';
  const location = teacher.location || 'Online';

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-[#ECE6DE] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_12px_32px_rgba(40,30,20,0.08)]">
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-[4/3.2] w-full overflow-hidden rounded-2xl bg-stone-100">
          <Image
            src={imageUrl}
            alt={teacher.name}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Top-Right: Subject Badge */}
          <div className="absolute right-2.5 top-2.5 rounded-full border border-amber-200/80 bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 shadow-sm backdrop-blur-sm">
            {subject}
          </div>

          {/* Top-Left: Verified Badge */}
          <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full border border-emerald-200/80 bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 shadow-sm backdrop-blur-sm">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span>Verified</span>
          </div>

          {/* Bottom-Left: Rating Pill */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full border border-stone-200/70 bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-stone-900 shadow-sm backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
            <span>{rating.toFixed(1)}</span>
            <span className="text-[10px] font-normal text-stone-500">({reviews})</span>
          </div>
        </div>

        {/* Teacher Info */}
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <Link href={href} className="group-hover:text-amber-900 transition-colors">
              <h3 className="font-display text-lg font-bold text-[#1C1815] line-clamp-1">
                {teacher.name}
              </h3>
            </Link>
          </div>

          <p className="mt-0.5 text-xs font-semibold text-amber-800 line-clamp-1">
            {specialization}
          </p>

          {/* Experience & Location */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500">
            <div className="flex items-center gap-1">
              <Briefcase className="h-3 w-3 text-stone-400" />
              <span>{experience}</span>
            </div>
            {location ? (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-stone-400" />
                <span>{location}</span>
              </div>
            ) : null}
          </div>

          {/* Meta Stats Row (Courses, Students) */}
          <div className="mt-3.5 flex items-center justify-between border-t border-[#F2ECE4] pt-3 text-[11px] text-stone-600">
            <div className="flex items-center gap-1.5 font-medium">
              <BookOpen className="h-3.5 w-3.5 text-amber-700" />
              <span>{courses} Course{courses === 1 ? '' : 's'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="h-3.5 w-3.5 text-orange-700" />
              <span>{enrollments} Student{enrollments === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-[#F2ECE4] pt-4">
        <Link
          href={href}
          className="flex items-center justify-center rounded-full border border-stone-300/80 bg-white px-3 py-2 text-xs font-semibold text-[#1C1815] transition hover:bg-stone-50 hover:border-stone-400 active:scale-95"
        >
          View Profile
        </Link>
        <Link
          href={`${href}#teacher-courses`}
          className="flex items-center justify-center rounded-full bg-[#1C1815] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#342D27] active:scale-95 shadow-sm"
        >
          Start Learning
        </Link>
      </div>
    </article>
  );
}
