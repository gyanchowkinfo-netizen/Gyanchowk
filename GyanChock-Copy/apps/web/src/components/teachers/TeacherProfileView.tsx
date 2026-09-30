'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/Page';
import { ErrorState } from '@/components/ui/States';
import { ScrollProgress } from '@/components/motion';
import { api } from '@/lib/api';
import type { BatchCardData, CourseCardData, TeacherCardData } from '@/lib/types';
import { TeacherProfileHero } from './TeacherProfileHero';
import { TeacherProfileTabs, type ProfileTabId } from './TeacherProfileTabs';
import { TeacherAboutCard } from './TeacherAboutCard';
import { TeacherSubjectsCard } from './TeacherSubjectsCard';
import { TeacherAchievementsCard } from './TeacherAchievementsCard';
import { TeacherReviewsCarousel } from './TeacherReviewsCarousel';
import { TeacherQuoteCard } from './TeacherQuoteCard';
import { TeacherDoubtCard } from './TeacherDoubtCard';
import { TeacherFeaturedCoursesCard } from './TeacherFeaturedCoursesCard';
import { TeacherBenefitsStrip } from './TeacherBenefitsStrip';

export interface TeacherProfilePayload {
  teacher: TeacherCardData;
  courses: CourseCardData[];
  batches?: BatchCardData[];
  reviews?: any[];
  achievements?: any[];
  quote?: any;
  doubtCTA?: any;
}

export function TeacherProfileSkeleton() {
  return (
    <PageContainer className="!py-8 bg-[#FAF7F2]">
      <div className="h-80 w-full animate-pulse rounded-[2.5rem] bg-stone-200/60" />
      <div className="mt-8 h-12 w-96 animate-pulse rounded-full bg-stone-200/50" />
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <div className="h-64 rounded-3xl bg-stone-200/40 animate-pulse" />
          <div className="h-44 rounded-3xl bg-stone-200/40 animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="h-44 rounded-3xl bg-stone-200/40 animate-pulse" />
          <div className="h-32 rounded-3xl bg-stone-200/40 animate-pulse" />
        </div>
      </div>
    </PageContainer>
  );
}

export function TeacherProfileView({
  slug,
  initial,
  loadError,
}: {
  slug: string;
  initial?: TeacherProfilePayload;
  loadError?: string;
}) {
  const [activeTab, setActiveTab] = useState<ProfileTabId>('about');

  const query = useQuery({
    queryKey: ['teacher-profile', slug],
    queryFn: async () => {
      // Try dedicated teacher endpoint first, then catalog endpoint
      try {
        const res = await api<any>(`/api/teachers/${slug}`);
        if (res.teacher) return res;
        return { teacher: res, courses: res.courses || [] };
      } catch {
        return api<TeacherProfilePayload>(`/api/catalog/teachers/${slug}`);
      }
    },
    initialData: initial,
  });

  if (query.isLoading && !query.data) return <TeacherProfileSkeleton />;

  if (query.error || (loadError && !query.data)) {
    return (
      <PageContainer className="!py-12 bg-[#FAF7F2]">
        <ErrorState
          message="Unable to load this teacher profile. Please try again."
          onRetry={() => void query.refetch()}
        />
      </PageContainer>
    );
  }

  const teacher = query.data?.teacher;
  if (!teacher) {
    return (
      <PageContainer className="!py-12 bg-[#FAF7F2]">
        <ErrorState message="Teacher not found" onRetry={() => void query.refetch()} />
      </PageContainer>
    );
  }

  const courses = query.data?.courses ?? [];

  function handleTabChange(tab: ProfileTabId) {
    setActiveTab(tab);
    if (tab === 'about') {
      document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tab === 'courses') {
      document.getElementById('teacher-courses')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tab === 'reviews') {
      document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tab === 'achievements') {
      document.getElementById('achievements-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tab === 'qa') {
      document.getElementById('qa-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1815] pb-16">
      <ScrollProgress />

      <PageContainer className="!py-6 sm:!py-8 max-w-7xl mx-auto">
        {/* HERO SECTION */}
        <TeacherProfileHero
          teacher={teacher}
          onStartLearning={() => handleTabChange('courses')}
        />

        {/* TABS NAVIGATION */}
        <TeacherProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* 2-COLUMN MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start mt-6">
          {/* LEFT COLUMN: About, Subjects, Achievements */}
          <div className="space-y-6">
            <TeacherAboutCard teacher={teacher} />
            <TeacherSubjectsCard teacher={teacher} />
            <TeacherAchievementsCard teacher={teacher} />
          </div>

          {/* RIGHT COLUMN: Quote, Doubt Q&A CTA, Featured Courses */}
          <div className="space-y-6">
            <TeacherQuoteCard teacher={teacher} />
            <TeacherDoubtCard teacher={teacher} />
            <TeacherFeaturedCoursesCard teacher={teacher} catalogCourses={courses} />
          </div>
        </div>

        {/* FULL WIDTH STUDENT REVIEWS SECTION */}
        <div className="mt-8">
          <TeacherReviewsCarousel teacher={teacher} />
        </div>

        {/* BOTTOM LEARNING BENEFITS STRIP */}
        <TeacherBenefitsStrip benefits={teacher.benefits} />
      </PageContainer>
    </div>
  );
}
