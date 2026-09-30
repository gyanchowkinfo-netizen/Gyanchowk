'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { rememberCourse } from '@/lib/hooks';
import { toast } from '@/lib/toast';
import { formatPrice } from '@/lib/format';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import type { CourseDetail, CourseCardData } from '@/lib/types';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { X, Play, PhoneCall } from 'lucide-react';

// New Course Detail Components
import { CourseDetailHero } from '@/components/courses/detail/CourseDetailHero';
import { CourseNavigationTabs } from '@/components/courses/detail/CourseNavigationTabs';
import { CourseAboutSection } from '@/components/courses/detail/CourseAboutSection';
import { CourseFeaturesSection } from '@/components/courses/detail/CourseFeaturesSection';
import { CourseIncludesCard } from '@/components/courses/detail/CourseIncludesCard';
import { CourseCurriculumSection } from '@/components/courses/detail/CourseCurriculumSection';
import { CourseInstructorSection } from '@/components/courses/detail/CourseInstructorSection';
import { CourseFAQSection } from '@/components/courses/detail/CourseFAQSection';
import { CourseFinalCTA } from '@/components/courses/detail/CourseFinalCTA';

interface Lesson {
  _id: string;
  title: string;
  isDemo?: boolean;
  chapter?: string;
  video?: string;
}

interface Chapter {
  _id: string;
  name: string;
}

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [savingWishlist, setSavingWishlist] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['course', slug],
    queryFn: () =>
      api<{
        course: CourseDetail;
        lessons: Lesson[];
        chapters: Chapter[];
        related: CourseCardData[];
      }>(`/api/courses/${slug}`),
  });

  const course = data?.course;
  const demoLesson = (data?.lessons ?? []).find((l) => l.isDemo && l.video);
  const hasDemoVideo = Boolean(demoLesson?.video || course?.demoVideo?.publicId || course?.demoVideo?.url);

  useEffect(() => {
    if (course) {
      rememberCourse(course.slug, course.title);
    }
  }, [course]);

  async function handleEnroll() {
    if (!user) return router.push(`/login?next=/courses/${slug}`);
    if (!course) return;
    router.push(`/checkout/${course._id}?type=course`);
  }

  async function handleSaveWishlist() {
    if (!user) return router.push('/login');
    setSavingWishlist(true);
    try {
      await api(`/api/learning/wishlist/${course?._id}`, { method: 'POST' });
      toast.success('Saved to wishlist');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSavingWishlist(false);
    }
  }

  function handleWatchPreview() {
    if (demoLesson?.video) {
      setPreviewId(String(demoLesson.video));
    } else if (course?.demoVideo?.publicId) {
      setPreviewId(course.demoVideo.publicId);
    } else {
      toast.info('No video demo attached yet. You can preview syllabus below.');
      const syllabusEl = document.getElementById('syllabus');
      if (syllabusEl) {
        syllabusEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingState label="Loading course details…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <EmptyState title="Course not found" />
      </div>
    );
  }

  const visibility = course.sectionVisibility || {};
  const isVisible = (key: keyof typeof visibility) => visibility[key] !== false;

  const priceFormatted = formatPrice(course.price, course.discountPercent, course.pricingType);

  return (
    <div className="min-h-screen bg-slate-50/30 text-slate-800">
      {/* Hero Section */}
      <CourseDetailHero
        course={course}
        onEnroll={handleEnroll}
        onSaveWishlist={handleSaveWishlist}
        onWatchPreview={hasDemoVideo ? handleWatchPreview : undefined}
        saving={savingWishlist}
        hasDemoVideo={hasDemoVideo}
      />

      {/* Sticky Tab Navigation */}
      <CourseNavigationTabs />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 sm:space-y-14">
        {/* About This Course & What You'll Learn */}
        {isVisible('overview') && <CourseAboutSection course={course} />}

        {/* Course Includes (Directly Below About This Course) */}
        {isVisible('includes') && <CourseIncludesCard course={course} />}

        {/* Course Features & Benefits - FULL WIDTH (2x3 or 3-column grid) */}
        {isVisible('features') && <CourseFeaturesSection course={course} />}

        {/* Course Structure & Curriculum - FULL WIDTH */}
        {isVisible('syllabus') && (
          <CourseCurriculumSection
            course={course}
            chapters={data?.chapters}
            lessons={data?.lessons}
            onPreviewLesson={(lesson) => {
              if (lesson.video) setPreviewId(String(lesson.video));
            }}
          />
        )}

        {/* Instructors & Faculty - FULL WIDTH */}
        {isVisible('instructors') && <CourseInstructorSection course={course} />}

        {/* Frequently Asked Questions - FULL WIDTH */}
        {isVisible('faqs') && <CourseFAQSection course={course} />}

        {/* Have Questions? Support Section (Below FAQs) */}
        <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/50 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 border border-amber-300/80 shadow-2xs">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">Have Questions?</h4>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  Connect with our academic counselors for guidance on syllabus, study plans, or scholarships.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 sm:self-center">
              <div className="rounded-xl border border-amber-300/90 bg-white px-4 py-2.5 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block leading-tight">Academic Counselor Helpline</span>
                <span className="text-sm sm:text-base font-extrabold text-amber-700 tracking-tight">Toll Free: 1800-GYAN-CHOWK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Section - FULL WIDTH */}
        {isVisible('finalCta') && (
          <CourseFinalCTA course={course} onEnroll={handleEnroll} />
        )}
      </main>

      {/* Demo Video Player Modal */}
      {previewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewId(null)}
              aria-label="Close Preview"
              className="absolute right-3.5 top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-white backdrop-blur-md hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="aspect-video w-full">
              <VideoPlayer videoId={previewId} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Enrollment Bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/90 bg-white/95 px-4 py-3 backdrop-blur-md shadow-lg lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-lg font-bold text-slate-900">{priceFormatted}</span>
            <span className="text-[11px] text-slate-500 block leading-tight">
              {course.validityDays ?? 365} days validity
            </span>
          </div>

          <button
            type="button"
            onClick={handleEnroll}
            className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-amber-500 active:scale-95"
          >
            <span>Enroll Now</span>
            <Play className="h-3 w-3 fill-slate-950" />
          </button>
        </div>
      </div>

    </div>
  );
}
