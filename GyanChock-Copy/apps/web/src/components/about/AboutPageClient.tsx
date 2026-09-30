'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Settings2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ScrollProgress } from '@/components/motion';
import type { AboutPageConfig, CmsPage, PublicPlatformStats } from '@/lib/types';
import { DEFAULT_ABOUT_PAGE_CONFIG, normalizeAboutPageConfig } from '@/lib/types';
import { AboutHero } from './AboutHero';
import { Mission } from './Mission';
import { Vision } from './Vision';
import { WhyGyanChowk } from './WhyGyanChowk';
import { Values } from './Values';
import { PlatformFeatures } from './PlatformFeatures';
import { FutureVision } from './FutureVision';
import { AboutCTA } from './AboutCTA';

function pageText(pages: CmsPage[], key: string, fallbackTitle: string, fallbackBody: string) {
  const page = pages.find((p) => p.key === key);
  return {
    title: page?.title?.trim() || fallbackTitle,
    body: page?.body?.trim() || fallbackBody,
  };
}

export function AboutPageClient({
  pages,
  stats,
  initialConfig,
}: {
  pages: CmsPage[];
  stats?: PublicPlatformStats;
  initialConfig?: AboutPageConfig | null;
}) {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ['about-page-cms'],
    queryFn: () => api<{ aboutPage?: AboutPageConfig | null }>('/api/cms/about-page'),
    initialData: initialConfig ? { aboutPage: initialConfig } : undefined,
  });

  const about = pageText(
    pages,
    'about',
    'A structured learning ecosystem',
    'Gyan Chowk helps students learn, practice, improve and move toward their goals through recorded courses, batches, tests, doubts and career guidance.',
  );
  const legacyMission = pageText(
    pages,
    'about-mission',
    'Give every student a clear path from first lesson to next opportunity.',
    about.body,
  );
  const legacyVision = pageText(
    pages,
    'about-vision',
    'Learning, practice and progress in one place.',
    'We are building an ecosystem where courses, batches, teachers, tests and career maps work together — so students improve with evidence, not guesswork.',
  );
  const legacyFuture = pageText(
    pages,
    'about-future',
    'A larger, more personal recorded-learning ecosystem.',
    'The next chapter is better analytics, stronger career support and more programmes — still recorded-first.',
  );

  // Normalize loaded configuration with robust schema adaptors & default fallbacks
  const config: AboutPageConfig = useMemo(() => {
    return normalizeAboutPageConfig(data?.aboutPage);
  }, [data?.aboutPage]);

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#1C1815]">
      <ScrollProgress />

      {/* 1. Hero */}
      <AboutHero config={config.hero} />

      {/* 2. Mission */}
      <Mission
        config={config.mission}
        title={config.mission?.heading || legacyMission.title}
        body={config.mission?.body || legacyMission.body}
      />

      {/* 3. Vision */}
      <Vision
        config={config.vision}
        title={config.vision?.heading || legacyVision.title}
        body={config.vision?.description || legacyVision.body}
      />

      {/* 4. Why Gyan Chowk */}
      <WhyGyanChowk config={config.whyGyanChowk} />

      {/* 5. Values */}
      <Values config={config.values} />

      {/* 6. Platform Features */}
      <PlatformFeatures config={config.platformFeatures} />

      {/* 7. Future Vision */}
      <FutureVision
        config={config.futureVision}
        title={config.futureVision?.heading || legacyFuture.title}
        body={config.futureVision?.description || legacyFuture.body}
      />

      {/* 10. CTA */}
      <AboutCTA config={config.cta} />

      {/* Admin Quick Editor Button */}
      {user?.role === 'admin' && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link
            href="/admin/about-page"
            className="flex items-center gap-2 rounded-full border border-[#c4a05a]/60 bg-[#1C1815] px-4 py-2.5 text-xs font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-[#8C6228]"
          >
            <Settings2 className="h-4 w-4 text-[#c4a05a]" />
            <span>Manage About Page</span>
          </Link>
        </div>
      )}
    </main>
  );
}
