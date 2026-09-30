'use client';

import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import type { CourseDetail } from '@/lib/types';

interface CourseAboutSectionProps {
  course: CourseDetail;
}

export function CourseAboutSection({ course }: CourseAboutSectionProps) {
  const outcomes = course.outcomes?.length
    ? course.outcomes
    : [
        'Master fundamental to advanced concepts required for competitive and academic success',
        'Learn structured problem-solving methodologies from top educators and industry experts',
        'Gain access to high-yield practice problem sets with complete step-by-step video solutions',
        'Boost exam readiness through timed mock tests, accuracy analytics, and personalized feedback',
      ];

  const description =
    course.description ||
    `This ${course.title} program is meticulously structured to provide you with a robust conceptual foundation and deep practical mastery. Guided by seasoned educators, you will engage in comprehensive lectures, rigorous mock tests, real-world case studies, and dedicated 24/7 doubt resolution to achieve peak academic performance.`;

  return (
    <div className="space-y-8">
      {/* About Section */}
      <section id="overview" className="scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          About This Course
        </h2>
        <div className="mt-3.5 prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-600">
          <p className="whitespace-pre-line">{description}</p>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section id="learn" className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            What You&apos;ll Learn
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {outcomes.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs sm:text-sm text-slate-700"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
