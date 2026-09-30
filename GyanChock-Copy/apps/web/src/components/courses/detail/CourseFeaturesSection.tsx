'use client';

import React from 'react';
import {
  BookOpen,
  ClipboardCheck,
  Video,
  BarChart3,
  GraduationCap,
  MessageCircleQuestion,
} from 'lucide-react';
import type { CourseDetail } from '@/lib/types';

interface CourseFeaturesSectionProps {
  course: CourseDetail;
}

export function CourseFeaturesSection({ course }: CourseFeaturesSectionProps) {
  const defaultFeatures = [
    {
      title: 'Complete Syllabus Coverage',
      description: 'NCERT + Advanced Level Concepts thoroughly explained.',
      icon: 'book',
    },
    {
      title: 'Regular Mock Tests',
      description: 'Build speed, precision, and real-time exam stamina.',
      icon: 'test',
    },
    {
      title: 'Live & Recorded Classes',
      description: 'Flexible learning options with unlimited replay access.',
      icon: 'video',
    },
    {
      title: 'Performance Analysis',
      description: 'Track your growth with AI-powered diagnostic analytics.',
      icon: 'analytics',
    },
    {
      title: 'Expert Faculty',
      description: 'Learn from IIT/NIT qualified veteran educators.',
      icon: 'faculty',
    },
    {
      title: 'Doubt Support',
      description: 'Get round-the-clock help anytime, anywhere from mentors.',
      icon: 'doubt',
    },
  ];

  const features = course.features?.length ? course.features : defaultFeatures;

  const getIcon = (type: string, idx: number) => {
    switch (type) {
      case 'book':
        return <BookOpen className="h-5 w-5 text-amber-600" />;
      case 'test':
        return <ClipboardCheck className="h-5 w-5 text-emerald-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-blue-600" />;
      case 'analytics':
        return <BarChart3 className="h-5 w-5 text-purple-600" />;
      case 'faculty':
        return <GraduationCap className="h-5 w-5 text-amber-600" />;
      case 'doubt':
        return <MessageCircleQuestion className="h-5 w-5 text-rose-600" />;
      default:
        return idx % 2 === 0 ? (
          <BookOpen className="h-5 w-5 text-amber-600" />
        ) : (
          <ClipboardCheck className="h-5 w-5 text-blue-600" />
        );
    }
  };

  return (
    <section id="features" className="scroll-mt-28">
      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-4">
        Course Features & Benefits
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feat, idx) => {
          const iconType = feat.icon || (idx === 0 ? 'book' : idx === 1 ? 'test' : idx === 2 ? 'video' : idx === 3 ? 'analytics' : idx === 4 ? 'faculty' : 'doubt');
          return (
            <div
              key={idx}
              className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50/70 border border-amber-200/60 shadow-xs">
                {getIcon(iconType, idx)}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {feat.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
