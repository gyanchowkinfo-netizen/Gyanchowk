'use client';

import React from 'react';
import Image from 'next/image';
import { Award, Briefcase, GraduationCap, CheckCircle } from 'lucide-react';
import type { CourseDetail } from '@/lib/types';

interface CourseInstructorSectionProps {
  course: CourseDetail;
}

export function CourseInstructorSection({ course }: CourseInstructorSectionProps) {
  // Primary teacher from assigned teachers or course.instructorInfo or default
  const assignedTeacher = course.teachers?.[0];
  const customInfo = course.instructorInfo;

  const name =
    customInfo?.name ||
    assignedTeacher?.name ||
    course.teacherName ||
    'Senior Faculty Member';

  const role =
    customInfo?.role ||
    assignedTeacher?.headline ||
    `${course.category || 'Core'} Master Faculty`;

  const qualification =
    customInfo?.qualification ||
    (assignedTeacher as any)?.qualification ||
    'M.Tech / B.Tech from Top Tier Institute (IIT / NIT)';

  const experience =
    customInfo?.experience ||
    (assignedTeacher as any)?.experience ||
    '10+ Years of Competitive Teaching Experience';

  const bio =
    customInfo?.bio ||
    assignedTeacher?.bio ||
    'Renowned educator dedicated to conceptual clarity, mentorship, and high-yield problem solving. Mentored tens of thousands of top rankers across national engineering and civil examinations.';

  const avatarUrl =
    customInfo?.avatarUrl ||
    assignedTeacher?.avatar?.url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

  const expertiseList = Array.isArray(assignedTeacher?.expertise)
    ? assignedTeacher?.expertise
    : typeof assignedTeacher?.expertise === 'string'
    ? [assignedTeacher.expertise]
    : customInfo?.expertise
    ? customInfo.expertise.split(',').map((s) => s.trim())
    : ['Concept Clarity', 'Exam Strategies', 'High-Yield Problem Solving', 'Speed Techniques'];

  return (
    <section id="instructors" className="scroll-mt-28">
      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-4">
        Instructor & Faculty
      </h2>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xs">
            <Image
              src={avatarUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 96px, 112px"
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">{name}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                <CheckCircle className="h-3 w-3 text-amber-600" />
                Verified Educator
              </span>
            </div>

            <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-600">{role}</p>

            {/* Qualifications & Experience */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                {qualification}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                {experience}
              </span>
            </div>

            {/* Bio */}
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600">
              {bio}
            </p>

            {/* Expertise Badges */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {expertiseList.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
