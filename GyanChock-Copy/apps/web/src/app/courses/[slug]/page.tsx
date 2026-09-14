'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatPrice, salePrice } from '@/lib/format';
import { rememberCourse } from '@/lib/hooks';
import { toast } from '@/lib/toast';
import { PageContainer, Breadcrumbs } from '@/components/layout/Page';
import { Rating, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CourseCard } from '@/components/public/CourseCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import type { CourseCardData } from '@/lib/types';
import { AnimatedSection, ScrollProgress, ScaleIn, StaggerContainer, StaggerItem, TextReveal } from '@/components/motion';
import { SyllabusAccordion } from '@/components/motion/SyllabusAccordion';

interface Course extends CourseCardData {
  description?: string;
  validityDays?: number;
  outcomes?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  certificateEnabled?: boolean;
}

interface Lesson { _id: string; title: string; isDemo?: boolean; chapter?: string; video?: string }
interface Chapter { _id: string; name: string }
interface Review { _id: string; rating: number; body: string; verified?: boolean }

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['course', slug],
    queryFn: () =>
      api<{
        course: Course;
        lessons: Lesson[];
        chapters: Chapter[];
        reviews: Review[];
        related: CourseCardData[];
      }>(`/api/courses/${slug}`),
  });
  const course = data?.course;

  useEffect(() => {
    if (course) rememberCourse(course.slug, course.title);
  }, [course]);

  async function enroll() {
    if (!user) return router.push(`/login?next=/courses/${slug}`);
    if (!course) return;
    router.push(`/checkout/${course._id}?type=course`);
  }

  async function saveWishlist() {
    if (!user) return router.push('/login');
    setSaving(true);
    try {
      await api(`/api/learning/wishlist/${course?._id}`, { method: 'POST' });
      toast.success('Saved to wishlist');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <LoadingState label="Loading course…" />;
  if (error) return <PageContainer><ErrorState message={(error as Error).message} onRetry={() => void refetch()} /></PageContainer>;
  if (!course) return <EmptyState title="Course not found" />;

  const price = formatPrice(course.price, course.discountPercent, course.pricingType);
  const original = salePrice(course.price, 0, course.pricingType);

  return (
    <PageContainer>
      <ScrollProgress />
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/courses', label: 'Courses' }, { label: course.title }]} />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-xs tracking-[0.3em] text-gc-gold">{course.category ?? 'COURSE'}</p>
          <h1 className="mt-2 font-display text-4xl">
            <TextReveal text={course.title} />
          </h1>
          <p className="mt-3 text-gc-mist">{course.subtitle}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <Rating value={course.ratingAvg} count={course.ratingCount} />
            <span className="text-gc-mute">{course.enrollmentCount ?? 0} students</span>
            {course.teachers?.[0]?.name ? <span>By {course.teachers[0].name}</span> : null}
          </div>
          <AnimatedSection>
            <article className="mt-8 whitespace-pre-wrap text-gc-mist">{course.description}</article>
          </AnimatedSection>
          {course.outcomes?.length ? (
            <AnimatedSection>
              <h2 className="mt-10 font-display text-2xl text-gc-black">Outcomes</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gc-mist">
                {course.outcomes.map((o) => <li key={o}>{o}</li>)}
              </ul>
            </AnimatedSection>
          ) : null}
          <AnimatedSection>
            <h2 className="mt-10 font-display text-2xl text-gc-black">Syllabus</h2>
            <div className="mt-3">
              <SyllabusAccordion chapters={data.chapters ?? []} lessons={data.lessons ?? []} />
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <h2 className="mt-10 font-display text-2xl text-gc-black">Certificate</h2>
            <p className="mt-2 text-sm text-gc-mist">
              {course.certificateEnabled ? 'A verifiable Gyan Chowk certificate is issued at ~90% completion.' : 'Certificate is not enabled for this course.'}
            </p>
          </AnimatedSection>
          <AnimatedSection>
            <h2 className="mt-10 font-display text-2xl text-gc-black">Reviews</h2>
            <ul className="mt-3 space-y-3">
              {(data.reviews ?? []).map((r) => (
                <li key={r._id} className="gc-card p-4 text-sm">
                  <Rating value={r.rating} />
                  {r.verified ? <StatusBadge status="verified student" /> : null}
                  <p className="mt-2">{r.body}</p>
                </li>
              ))}
              {!data.reviews?.length ? <EmptyState title="No reviews yet" /> : null}
            </ul>
          </AnimatedSection>
          {(data.course.faqs ?? []).length ? (
            <AnimatedSection>
              <h2 className="mt-10 font-display text-2xl text-gc-black">FAQs</h2>
              {(data.course.faqs ?? []).map((f) => (
                <details key={f.question} className="gc-card mt-2 p-4">
                  <summary>{f.question}</summary>
                  <p className="mt-2 text-sm text-gc-mist">{f.answer}</p>
                </details>
              ))}
            </AnimatedSection>
          ) : null}
        </div>
        <aside className="lg:sticky lg:top-24 h-fit gc-card p-5">
          <ScaleIn>
            <p className="font-display text-3xl text-gc-black">{price}</p>
          </ScaleIn>
          {original > 0 && course.discountPercent ? (
            <p className="text-sm text-gc-mute line-through">{formatPrice(course.price, 0)}</p>
          ) : null}
          <p className="mt-2 text-xs text-gc-mute">Validity {course.validityDays ?? 365} days</p>
          <Button className="mt-4 w-full" onClick={() => void enroll()}>
            Enroll now <span className="gc-btn-arrow">→</span>
          </Button>
          <Button variant="ghost" className="mt-2 w-full" loading={saving} onClick={() => void saveWishlist()}>
            Save for later
          </Button>
          <p className="mt-3 text-xs text-gc-mute">Paid access unlocks only after Razorpay verification on the server.</p>
        </aside>
      </div>
      {(data.related ?? []).length ? (
        <div className="mt-12">
          <h2 className="mb-4 font-display text-2xl text-gc-black">Related courses</h2>
          <StaggerContainer className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.related.map((c) => (
              <StaggerItem key={c._id}>
                <CourseCard course={c} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      ) : null}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-gc-line bg-gc-navy/95 p-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="text-gc-gold">{price}</span>
          <Button onClick={() => void enroll()}>Enroll</Button>
        </div>
      </div>
    </PageContainer>
  );
}
