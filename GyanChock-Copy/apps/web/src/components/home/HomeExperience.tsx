'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/i18n/provider';
import type {
  CourseCardData,
  HomeDiscoveryPath,
  HomeFacultyCard,
  HomePlatformFeature,
  HomeSectionCopyMap,
  HomeTestSubscription,
  HomeWhyCard,
  PublicPlatformStats,
  TeacherCardData,
} from '@/lib/types';
import { SectionError } from './SectionError';
import { Hero } from './Hero';
import { BannerCarousel } from './BannerCarousel';
import { TrustStrip, type HomeHighlight } from './TrustStrip';
import { CategoryExplorer } from './CategoryExplorer';
import { FeaturedCourses } from './FeaturedCourses';
import { FeatureGrid } from './PlatformFeatures';
import { FacultySection } from './FacultySection';
import { PracticeSection, type HomeTest } from './PracticeSection';
import { TestSubscriptionSection } from './testSubscription/TestSubscriptionSection';
import { DEFAULT_HOME_TEST_SUBSCRIPTION } from './testSubscription/defaults';
import { DoubtMentorSection } from './DoubtMentorSection';
import { WhyGyanChowk } from './WhyGyanChowk';
import { DashboardPreview, ContinueLearning } from './Workspace';
import { FAQ, FinalCTA } from './Stories';
import { LandingStudentReviews } from './LandingStudentReviews';

export type HomeReview = {
  _id: string;
  body: string;
  rating?: number;
  verified?: boolean;
  user?: { name?: string };
  course?: { title?: string; category?: string };
};

export function HomeExperience() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const cms = useQuery({
    queryKey: ['cms-public'],
    queryFn: () =>
      api<{
        faqs: Array<{ _id: string; question: string; answer: string }>;
        featuredCourses: CourseCardData[];
        featuredReviews?: HomeReview[];
        stats?: PublicPlatformStats;
        highlights?: HomeHighlight[];
        discovery?: HomeDiscoveryPath[];
        platform?: HomePlatformFeature[];
        faculty?: HomeFacultyCard[];
        sections?: HomeSectionCopyMap;
        testSubscription?: HomeTestSubscription | null;
        why?: HomeWhyCard[];
      }>('/api/cms/public'),
    enabled: ready,
  });
  const teachers = useQuery({
    queryKey: ['home-teachers'],
    queryFn: () => api<{ items: TeacherCardData[] }>('/api/catalog/teachers'),
    enabled: ready,
  });
  const enrollments = useQuery({
    queryKey: ['home-enrollments'],
    queryFn: () =>
      api<{
        items: Array<{
          course?: { _id: string; title: string; slug: string };
        }>;
      }>('/api/learning/enrollments'),
    enabled: Boolean(user),
  });
  const analytics = useQuery({
    queryKey: ['home-analytics'],
    queryFn: () => api<{ avgCompletion?: number }>('/api/learning/analytics'),
    enabled: Boolean(user),
  });
  const tests = useQuery({
    queryKey: ['home-tests'],
    queryFn: () => api<{ items: HomeTest[] }>('/api/tests'),
    enabled: Boolean(user),
  });

  function onSearch(q: string) {
    router.push(q ? `/courses?q=${encodeURIComponent(q)}` : '/courses');
  }

  const continueItems = (enrollments.data?.items ?? [])
    .filter((e) => e.course)
    .map((e) => ({
      id: e.course!._id,
      title: e.course!.title,
      href: `/student/learning/${e.course!._id}`,
    }));

  const categoryCounts: Record<string, number> = {};
  for (const c of cms.data?.featuredCourses ?? []) {
    const key = c.category || c.targetExam;
    if (key) categoryCounts[key] = (categoryCounts[key] ?? 0) + 1;
  }

  const courses = cms.data?.featuredCourses ?? [];
  const testPrimeFromApi = cms.data?.testSubscription;
  const testPrimeData = testPrimeFromApi ?? DEFAULT_HOME_TEST_SUBSCRIPTION;
  const testPrimeSettled = cms.isFetched;

  return (
    <main>
      <SectionError label="Promotions could not load.">
        <BannerCarousel />
      </SectionError>
      <Hero
        kicker={t.hero.kicker}
        title={t.hero.title}
        body={t.hero.body}
        cta={t.hero.cta}
        secondary={t.hero.secondary}
        onSearch={onSearch}
      />
      <TrustStrip highlights={cms.data?.highlights} />
      <CategoryExplorer counts={categoryCounts} paths={cms.data?.discovery} copy={cms.data?.sections?.discovery} />
      <SectionError label="Courses could not load.">
        <FeaturedCourses
          courses={courses}
          loading={cms.isLoading}
          error={cms.isError ? 'Something interrupted your learning session.' : undefined}
          onRetry={() => void cms.refetch()}
          copy={cms.data?.sections?.featured}
        />
      </SectionError>
      <FeatureGrid features={cms.data?.platform} copy={cms.data?.sections?.platform} />
      <PracticeSection tests={tests.data?.items ?? []} loading={Boolean(user) && tests.isLoading} />
      <TestSubscriptionSection data={testPrimeData} settled={testPrimeSettled} />
      <DoubtMentorSection copy={cms.data?.sections?.mentorship} />
      <SectionError label="Faculty could not load.">
        <FacultySection
          teachers={teachers.data?.items ?? []}
          faculty={cms.data?.faculty}
          copy={cms.data?.sections?.faculty}
          loading={teachers.isLoading}
        />
      </SectionError>
      <DashboardPreview completion={analytics.data?.avgCompletion} />
      <ContinueLearning items={continueItems} />
      <WhyGyanChowk cards={cms.data?.why} />
      <FAQ faqs={cms.data?.faqs ?? []} />
      <FinalCTA />
      <SectionError label="Student reviews could not load.">
        <LandingStudentReviews reviews={cms.data?.featuredReviews as any} />
      </SectionError>
    </main>
  );
}
