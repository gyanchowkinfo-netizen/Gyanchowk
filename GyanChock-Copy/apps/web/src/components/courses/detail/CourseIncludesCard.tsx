'use client';

import React from 'react';
import {
  Video,
  FileText,
  BookOpen,
  MessageSquare,
  Clock,
  CheckCircle,
} from 'lucide-react';
import type { CourseDetail } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CourseIncludesCardProps {
  course: CourseDetail;
  className?: string;
}

export function CourseIncludesCard({ course, className }: CourseIncludesCardProps) {
  const defaultIncludes = [
    {
      title: 'Video Lectures',
      subtitle: '200+ Hours of high-definition content',
      icon: 'video',
    },
    {
      title: 'Mock Tests',
      subtitle: '50+ Full-length & chapter-wise tests',
      icon: 'test',
    },
    {
      title: 'Study Material',
      subtitle: 'Curated PDF Notes, Formula Sheets & E-Books',
      icon: 'book',
    },
    {
      title: 'Doubt Sessions',
      subtitle: 'Live interactive & asynchronous mentor support',
      icon: 'chat',
    },
    {
      title: 'Validity',
      subtitle: `${course.validityDays ?? 365} Days complete access`,
      icon: 'clock',
    },
  ];

  const includes = course.includes?.length ? course.includes : defaultIncludes;

  const getIncludeIcon = (iconName?: string, idx = 0) => {
    switch (iconName) {
      case 'video':
        return <Video className="h-4 w-4 text-amber-600" />;
      case 'test':
        return <FileText className="h-4 w-4 text-emerald-600" />;
      case 'book':
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'clock':
        return <Clock className="h-4 w-4 text-teal-600" />;
      default:
        return idx % 2 === 0 ? (
          <Video className="h-4 w-4 text-amber-600" />
        ) : (
          <CheckCircle className="h-4 w-4 text-emerald-600" />
        );
    }
  };

  return (
    <div
      id="includes"
      className={cn(
        'rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm shadow-slate-900/5 scroll-mt-28',
        className,
      )}
    >
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
        Course Includes
      </h3>

      <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {includes.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              {getIncludeIcon(item.icon, idx)}
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {item.title}
              </p>
              {item.subtitle && (
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
