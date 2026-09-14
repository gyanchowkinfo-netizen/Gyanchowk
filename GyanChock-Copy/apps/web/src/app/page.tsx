'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/i18n/provider';
import { EmptyState, LoadingState } from '@/components/ui/States';
import type { CourseCardData, BatchCardData, TeacherCardData } from '@/lib/types';
import {
  HeroSection,
  CategoryGrid,
  FeaturedCourseSection,
  FeaturedBatchSection,
  FeatureGrid,
  HowItWorks,
  TeacherCarousel,
  StatsSection,
  TestimonialSection,
  FAQSection,
  CTASection,
} from '@/components/public/HomeSections';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/motion';
import { PageContainer, SectionHeader } from '@/components/layout/Page';

const categories = ['JEE', 'NEET', 'Boards', 'Career', 'Programming', 'Government exams'];
const features: Array<[string, string]> = [
  ['Recorded video', 'HLS streaming, resume playback and enrollment-gated access.'],
  ['Batches', 'Schedules, attendance and announcements without live class noise.'],
  ['Tests', 'MCQ to subjective, negative marking, ranks and solutions.'],
  ['Doubts', 'Async doubt engine with images, assignment and follow-ups.'],
  ['Mentorship', 'Goals, notes and scheduled reviews — not live streaming.'],
  ['Backlog planner', 'See incomplete chapters and set daily targets.'],
];

export default function HomePage() {
  const { t } = useI18n();
  const router = useRouter();
  const cms = useQuery({
    queryKey: ['cms-public'],
    queryFn: () =>
      api<{
        faqs: Array<{ _id: string; question: string; answer: string }>;
        featuredCourses: CourseCardData[];
      }>('/api/cms/public'),
  });
  const batches = useQuery({
    queryKey: ['home-batches'],
    queryFn: () => api<{ items: BatchCardData[] }>('/api/batches?limit=4'),
  });
  const teachers = useQuery({
    queryKey: ['home-teachers'],
    queryFn: () => api<{ items: TeacherCardData[] }>('/api/catalog/teachers'),
  });

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get('q') || '');
    router.push(`/courses?q=${encodeURIComponent(q)}`);
  }

  return (
    <main>
      <HeroSection
        kicker={t.hero.kicker}
        title={t.hero.title}
        body={t.hero.body}
        cta={t.hero.cta}
        secondary={t.hero.secondary}
        onSearch={onSearch}
      />
      <CategoryGrid categories={categories} />
      <FeaturedCourseSection courses={cms.data?.featuredCourses ?? []} loading={cms.isLoading} />
      {!cms.isLoading && !(cms.data?.featuredCourses?.length) ? (
        <PageContainer>
          <EmptyState title="Courses will appear after seed" body="Run npm run seed with MongoDB running." action={{ href: '/courses', label: 'Browse' }} />
        </PageContainer>
      ) : null}
      <FeaturedBatchSection batches={batches.data?.items ?? []} />
      <FeatureGrid items={features} />
      <HowItWorks steps={['Pick a course or batch', 'Enroll (free or Razorpay verified)', 'Watch recorded lessons', 'Test, doubt, rank, certificate']} />
      {teachers.isLoading ? <LoadingState /> : <TeacherCarousel teachers={teachers.data?.items ?? []} />}
      <AnimatedSection>
        <PageContainer>
          <SectionHeader title="Learning that compounds" />
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Recorded first', 'Adaptive HLS, not giant MP4 downloads'],
              ['Exam engine', 'Palette, autosave, ranks'],
              ['Doubt desk', 'Pending → answered, no live chat class'],
              ['Career track', 'Roadmaps, articles, interviews'],
            ].map(([h, b]) => (
              <StaggerItem key={h}>
                <article className="gc-card p-5">
                  <h3 className="text-gc-gold">{h}</h3>
                  <p className="mt-2 text-sm text-gc-mute">{b}</p>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </PageContainer>
      </AnimatedSection>
      <StatsSection
        items={[
          ['Students', 'Active learners on recorded paths'],
          ['Courses', 'Paid and free programmes'],
          ['Tests', 'Ranked attempts, not DPP'],
          ['Mentors', 'Async guidance'],
        ]}
      />
      <AnimatedSection>
        <PageContainer>
          <SectionHeader title="Tests and exam preparation" href="/courses" />
          <p className="max-w-2xl text-gc-mist">
            Timed papers, sectioning, negative marking and All-India / state / batch ranks — calculated on the server, not in the browser.
          </p>
        </PageContainer>
      </AnimatedSection>
      <AnimatedSection>
        <PageContainer>
          <SectionHeader title="Career" href="/career" />
          <StaggerContainer className="grid gap-4 md:grid-cols-3">
            {[
              ['Roadmaps', '/career/roadmaps'],
              ['Articles', '/career'],
              ['Interview prep', '/career'],
            ].map(([label, href]) => (
              <StaggerItem key={label}>
                <Link href={href} className="gc-card block p-6 hover:border-gc-gold">
                  {label}
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </PageContainer>
      </AnimatedSection>
      <TestimonialSection
        quotes={[
          'The recorded lessons plus backlog planner kept my Physics completion honest.',
          'Ranks after mocks actually match the paper I sat — no fake leaderboard.',
          'Doubt answers came with images. No live class FOMO.',
        ]}
      />
      <FAQSection faqs={cms.data?.faqs ?? []} />
      <CTASection />
    </main>
  );
}
