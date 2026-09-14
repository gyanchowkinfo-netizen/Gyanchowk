'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatPrice, salePrice } from '@/lib/format';
import { PageContainer, Breadcrumbs } from '@/components/layout/Page';
import { Avatar, Rating, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/States';
import {
  AnimatedSection,
  CountUp,
  FloatingElement,
  Reveal,
  ScaleIn,
  ScrollProgress,
  StaggerContainer,
  StaggerItem,
  TextReveal,
  TiltCard,
} from '@/components/motion';
import { SyllabusAccordion } from '@/components/motion/SyllabusAccordion';
import type { BatchCardData } from '@/lib/types';

interface Payload {
  batch: BatchCardData & { schedule?: Array<{ day: string; startTime: string; endTime: string; title?: string }>; certificateEnabled?: boolean };
  subjects: Array<{ _id: string; name: string }>;
  chapters: Array<{ _id: string; name: string }>;
  lessons: Array<{ _id: string; title: string; isDemo?: boolean; chapter?: string }>;
  reviews: Array<{ _id?: string; rating: number; body: string; verified?: boolean; createdAt?: string; user?: { name?: string } }>;
  counts: { materials: number; assignments: number; tests: number; attendanceSessions: number; lessons: number };
  enrollment: { status?: string; expiresAt?: string; expired?: boolean } | null;
  progressPercent: number | null;
}

export function BatchDetailSkeleton() {
  return (
    <PageContainer>
      <div className="h-4 w-40 animate-pulse rounded bg-gc-navy" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="h-64 animate-pulse rounded-3xl bg-gc-navy" />
        <div className="h-48 animate-pulse rounded-3xl bg-gc-navy" />
      </div>
    </PageContainer>
  );
}

function EnrollCta({
  batch,
  enrollment,
  user,
}: {
  batch: Payload['batch'];
  enrollment: Payload['enrollment'];
  user: { role: string } | null;
}) {
  const router = useRouter();
  const courseId = batch.course && typeof batch.course === 'object' ? batch.course._id : undefined;
  const expired = Boolean(enrollment?.expired);
  const active = enrollment?.status === 'active' && !expired;

  if (user?.role === 'admin') {
    return (
      <Link href="/admin/batches" className="gc-btn-ghost mt-4 inline-flex w-full justify-center">
        Manage in admin
      </Link>
    );
  }
  if (user?.role === 'teacher') {
    return (
      <Link href="/teacher/batches" className="gc-btn-ghost mt-4 inline-flex w-full justify-center">
        Teacher batches
      </Link>
    );
  }
  if (active) {
    return (
      <Link href={courseId ? `/student/learning/${courseId}` : '/student/batches'} className="gc-btn-gold mt-4 inline-flex w-full justify-center">
        Continue learning <span className="gc-btn-arrow">→</span>
      </Link>
    );
  }
  const checkout = `/checkout/${batch._id}?type=batch`;
  return (
    <Button
      className="mt-4 w-full"
      onClick={() => {
        if (!user) return router.push(`/login?next=${encodeURIComponent(checkout)}`);
        router.push(checkout);
      }}
    >
      {expired ? 'Renew access' : 'Enroll now'} <span className="gc-btn-arrow">→</span>
    </Button>
  );
}

export function BatchDetailView({ slug }: { slug: string }) {
  const { user } = useAuth();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['batch', slug],
    queryFn: () => api<Payload>(`/api/batches/${slug}`),
  });

  if (isLoading && !data) return <BatchDetailSkeleton />;
  if (error) {
    return (
      <PageContainer>
        <ErrorState message="Unable to load this batch. Please try again." onRetry={() => void refetch()} />
      </PageContainer>
    );
  }
  const batch = data?.batch;
  if (!batch) {
    return (
      <PageContainer>
        <EmptyState title="Batch not found" action={{ href: '/batches', label: 'Browse batches' }} />
      </PageContainer>
    );
  }

  const seats = (batch.maxStudents ?? 0) - (batch.enrolledCount ?? 0);
  const course = batch.course && typeof batch.course === 'object' ? batch.course : null;
  const price = formatPrice(batch.price, batch.discountPercent);
  const original = salePrice(batch.price, 0);
  const exam = batch.targetExam || batch.examCategory;
  const includes = [
    data.counts.lessons ? `${data.counts.lessons} recorded lessons` : null,
    data.counts.materials ? `${data.counts.materials} study materials` : 'Study materials after enrollment',
    data.counts.assignments ? `${data.counts.assignments} published assignments` : 'Assignments when published',
    data.counts.tests ? `${data.counts.tests} tests on record` : 'Tests when scheduled',
    'Async doubt desk',
    'Progress analytics',
    data.counts.attendanceSessions ? `${data.counts.attendanceSessions} attendance sessions` : null,
    course && 'certificateEnabled' in course && (course as { certificateEnabled?: boolean }).certificateEnabled
      ? 'Verifiable certificate'
      : null,
  ].filter(Boolean) as string[];

  return (
    <PageContainer>
      <ScrollProgress />
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/batches', label: 'Batches' }, { label: batch.name }]} />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <Reveal>
            <StatusBadge status={batch.status} />
          </Reveal>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">
            <TextReveal text={batch.name} />
          </h1>
          <p className="mt-3 text-gc-mist">{batch.description}</p>
          <StaggerContainer className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Exam', exam ?? '—'],
              ['Class', batch.targetClass ?? '—'],
              ['Language', batch.language ?? '—'],
              ['Enrolled', String(batch.enrolledCount ?? 0)],
            ].map(([label, value]) => (
              <StaggerItem key={label}>
                <div className="gc-card p-3">
                  <p className="text-xs text-gc-mute">{label}</p>
                  <p className="font-display text-lg text-gc-gold">{value}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          {data.enrollment?.status === 'active' && data.progressPercent != null ? (
            <AnimatedSection>
              <h2 className="mt-10 font-display text-2xl text-gc-black">Your progress</h2>
              <p className="mt-2 text-sm text-gc-mute">From saved lesson completion on the linked course.</p>
              <div className="mt-3 gc-card p-4">
                <p className="font-display text-2xl text-gc-black">
                  <CountUp value={Math.round(data.progressPercent)} suffix="%" />
                </p>
              </div>
            </AnimatedSection>
          ) : null}
          <AnimatedSection>
            <h2 className="mt-10 font-display text-2xl text-gc-black">Overview</h2>
            <ul className="mt-3 grid gap-2 text-sm text-gc-mist sm:grid-cols-2">
              <li className="gc-card p-3">Starts {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '—'}</li>
              <li className="gc-card p-3">Ends {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : '—'}</li>
              <li className="gc-card p-3">{batch.durationDays ? `${batch.durationDays} day programme` : `Validity ${batch.validityDays ?? 365} days`}</li>
              <li className="gc-card p-3">{batch.maxStudents ? `${Math.max(0, seats)} seats remaining` : 'Seat cap not set'}</li>
            </ul>
          </AnimatedSection>
          <AnimatedSection>
            <h2 className="mt-10 font-display text-2xl text-gc-black">Teachers</h2>
            <ul className="mt-3 flex flex-wrap gap-3">
              {(batch.teachers ?? []).map((t) => (
                <li key={t._id ?? t.name}>
                  {t._id ? (
                    <Link href={`/teachers/${t._id}`} className="gc-card flex items-center gap-3 p-3 hover:border-gc-gold">
                      <Avatar name={t.name} src={t.avatar?.url} size={40} />
                      <span>
                        <span className="block font-medium">{t.name}</span>
                        <span className="text-xs text-gc-mute">{t.headline}</span>
                      </span>
                    </Link>
                  ) : (
                    <span className="gc-card flex items-center gap-3 p-3">
                      <Avatar name={t.name} size={40} />
                      {t.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {!(batch.teachers ?? []).length ? <p className="mt-2 text-sm text-gc-mute">Faculty TBA</p> : null}
          </AnimatedSection>
          <AnimatedSection>
            <h2 className="mt-10 font-display text-2xl text-gc-black">Subjects</h2>
            {data.subjects.length ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {data.subjects.map((s) => (
                  <li key={s._id} className="gc-card px-3 py-1.5 text-sm">
                    {s.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gc-mute">Subjects appear after the linked course publishes a syllabus.</p>
            )}
          </AnimatedSection>
          <AnimatedSection>
            <h2 className="mt-10 font-display text-2xl text-gc-black">Curriculum</h2>
            <div className="mt-3">
              <SyllabusAccordion chapters={data.chapters} lessons={data.lessons} />
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <h2 className="mt-10 font-display text-2xl text-gc-black">What this batch includes</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {includes.map((item) => (
                <li key={item} className="gc-card p-3 text-sm text-gc-mist">
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedSection>
          <AnimatedSection>
            <h2 className="mt-10 font-display text-2xl text-gc-black">Schedule</h2>
            <ul className="mt-3 space-y-2">
              {(batch.schedule ?? []).map((s) => (
                <li key={`${s.day}-${s.startTime}`} className="gc-card px-4 py-3 text-sm">
                  {s.day} {s.startTime}–{s.endTime} {s.title}
                </li>
              ))}
            </ul>
            {!(batch.schedule ?? []).length ? <p className="mt-2 text-sm text-gc-mute">No timetable published yet.</p> : null}
          </AnimatedSection>
          <AnimatedSection>
            <h2 className="mt-10 font-display text-2xl text-gc-black">Reviews</h2>
            <p className="mt-1 text-xs text-gc-mute">From the linked published course, when reviews exist.</p>
            <StaggerContainer className="mt-3 space-y-3">
              {data.reviews.map((r, i) => (
                <StaggerItem key={r._id ?? i}>
                  <article className="gc-card p-4">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-medium">{r.user?.name ?? 'Student'}</p>
                      <Rating value={r.rating} />
                    </div>
                    <p className="mt-2 text-sm text-gc-mist">{r.body}</p>
                  </article>
                </StaggerItem>
              ))}
            </StaggerContainer>
            {!data.reviews.length ? <p className="mt-2 text-sm text-gc-mute">No verified reviews yet.</p> : null}
          </AnimatedSection>
          {course && 'faqs' in course && Array.isArray((course as { faqs?: Array<{ question: string; answer: string }> }).faqs) && (course as { faqs: Array<{ question: string; answer: string }> }).faqs.length ? (
            <AnimatedSection>
              <h2 className="mt-10 font-display text-2xl text-gc-black">FAQs</h2>
              {(course as { faqs: Array<{ question: string; answer: string }> }).faqs.map((f) => (
                <details key={f.question} className="gc-card mt-2 p-4">
                  <summary>{f.question}</summary>
                  <p className="mt-2 text-sm text-gc-mist">{f.answer}</p>
                </details>
              ))}
            </AnimatedSection>
          ) : null}
        </div>
        <aside className="h-fit">
          <TiltCard intensity={4}>
            <div className="gc-card relative overflow-hidden p-5">
              <div className="relative mb-4 h-36 overflow-hidden rounded-2xl bg-gradient-to-br from-gc-blue/30 to-gc-navy">
                {batch.thumbnail?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={batch.thumbnail.url} alt="" className="h-full w-full object-cover" />
                ) : null}
                <FloatingElement duration={4} className="absolute left-2 top-2">
                  <span className="gc-card px-2 py-1 text-[10px]">Calendar</span>
                </FloatingElement>
                <FloatingElement duration={5} className="absolute right-2 bottom-2">
                  <span className="gc-card px-2 py-1 text-[10px]">Certificate</span>
                </FloatingElement>
              </div>
              <ScaleIn>
                <p className="font-display text-3xl text-gc-black">{price}</p>
              </ScaleIn>
              {original > 0 && batch.discountPercent ? (
                <p className="text-sm text-gc-mute line-through">{formatPrice(batch.price, 0)}</p>
              ) : null}
              {batch.ratingCount ? (
                <p className="mt-2">
                  <Rating value={batch.ratingAvg} count={batch.ratingCount} />
                </p>
              ) : null}
              <p className="mt-2 text-xs text-gc-mute">Validity {batch.validityDays ?? 365} days</p>
              <EnrollCta batch={batch} enrollment={data.enrollment} user={user} />
              <p className="mt-3 text-xs text-gc-mute">Paid access unlocks only after Razorpay verification on the server.</p>
            </div>
          </TiltCard>
        </aside>
      </div>
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-gc-line bg-gc-navy/95 p-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="text-gc-gold">{price}</span>
          <Link
            href={
              data.enrollment?.status === 'active' && !data.enrollment.expired
                ? course && typeof course === 'object' && course._id
                  ? `/student/learning/${course._id}`
                  : '/student/batches'
                : user
                  ? `/checkout/${batch._id}?type=batch`
                  : `/login?next=${encodeURIComponent(`/checkout/${batch._id}?type=batch`)}`
            }
            className="gc-btn-gold"
          >
            {data.enrollment?.status === 'active' && !data.enrollment.expired ? 'Continue' : data.enrollment?.expired ? 'Renew' : 'Enroll'}
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
