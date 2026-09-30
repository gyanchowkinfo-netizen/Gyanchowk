'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Settings2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ScrollProgress } from '@/components/motion';
import { ErrorState } from '@/components/ui/States';
import type { CareerPageConfig, CareerJob } from '@/lib/types';
import { DEFAULT_CAREER_PAGE_CONFIG, normalizeCareerPageConfig } from '@/lib/types';
import { CareerHero } from './CareerHero';
import { WhyWorkWithUs } from './WhyWorkWithUs';
import { OpenPositions } from './OpenPositions';
import { LifeAtGyanChowk } from './LifeAtGyanChowk';
import { TeamTestimonials } from './TeamTestimonials';
import { CareerCTA } from './CareerCTA';

interface JobsResponse {
  jobs: CareerJob[];
  departments: string[];
  locations: string[];
  total: number;
}

export function CareerPageClient() {
  const user = useAuth((s) => s.user);

  const pageConfigQuery = useQuery({
    queryKey: ['career-page-config'],
    queryFn: () => api<{ config?: CareerPageConfig }>('/api/career/page-config'),
  });

  const jobsQuery = useQuery({
    queryKey: ['career-jobs-list'],
    queryFn: () => api<JobsResponse>('/api/career/jobs'),
  });

  const config: CareerPageConfig = useMemo(() => {
    return normalizeCareerPageConfig(pageConfigQuery.data?.config);
  }, [pageConfigQuery.data]);

  const jobs = useMemo(() => {
    return jobsQuery.data?.jobs ?? [];
  }, [jobsQuery.data]);

  const departments = useMemo(() => {
    return jobsQuery.data?.departments ?? [];
  }, [jobsQuery.data]);

  const locations = useMemo(() => {
    return jobsQuery.data?.locations ?? [];
  }, [jobsQuery.data]);

  if (pageConfigQuery.isError && jobsQuery.isError) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <ErrorState
          message="Unable to load career opportunities right now."
          onRetry={() => {
            void pageConfigQuery.refetch();
            void jobsQuery.refetch();
          }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#1C1815]">
      <ScrollProgress />

      {/* Section 1: Hero */}
      <CareerHero hero={config.hero} />

      {/* Section 2: Why Work With Us */}
      <WhyWorkWithUs config={config.whyWorkWithUs} />

      {/* Section 3: Open Positions (with Search & Filters) */}
      <OpenPositions
        header={config.openPositionsHeader}
        jobs={jobs}
        departments={departments}
        locations={locations}
        loading={jobsQuery.isLoading}
      />

      {/* Section 4: Life At Gyan Chowk */}
      <LifeAtGyanChowk config={config.lifeAtGyanChowk} />

      {/* Section 5: Team Testimonials */}
      <TeamTestimonials config={config.testimonials} />

      {/* Section 6: Final Career CTA */}
      <CareerCTA config={config.cta} />

      {/* Admin Quick Editor Button */}
      {user?.role === 'admin' && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link
            href="/admin/career"
            className="flex items-center gap-2 rounded-full border border-blue-400/50 bg-[#0c1a30] px-4 py-2.5 text-xs font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-[#152a4e]"
          >
            <Settings2 className="h-4 w-4 text-blue-400" />
            <span>Manage Career Page</span>
          </Link>
        </div>
      )}
    </main>
  );
}
