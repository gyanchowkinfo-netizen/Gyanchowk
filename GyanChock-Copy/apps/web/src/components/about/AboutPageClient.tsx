'use client';

import { ScrollProgress } from '@/components/motion';
import type { CmsPage, PublicPlatformStats } from '@/lib/types';
import { AboutHero } from './AboutHero';
import { Mission } from './Mission';
import { Vision } from './Vision';
import { WhyGyanChowk } from './WhyGyanChowk';
import { LearningEcosystem } from './LearningEcosystem';
import { Values } from './Values';
import { PlatformFeatures } from './PlatformFeatures';
import { Impact } from './Impact';
import { FutureVision } from './FutureVision';
import { AboutCTA } from './AboutCTA';

function pageText(pages: CmsPage[], key: string, fallbackTitle: string, fallbackBody: string) {
  const page = pages.find((p) => p.key === key);
  return {
    title: page?.title?.trim() || fallbackTitle,
    body: page?.body?.trim() || fallbackBody,
  };
}

export function AboutPageClient({ pages, stats }: { pages: CmsPage[]; stats?: PublicPlatformStats }) {
  const about = pageText(
    pages,
    'about',
    'A structured learning ecosystem',
    'Gyan Chowk helps students learn, practice, improve and move toward their goals through recorded courses, batches, tests, doubts and career guidance.',
  );
  const mission = pageText(
    pages,
    'about-mission',
    'Give every student a clear path from first lesson to next opportunity.',
    about.body,
  );
  const vision = pageText(
    pages,
    'about-vision',
    'Learning, practice and progress in one place.',
    'We are building an ecosystem where courses, batches, teachers, tests and career maps work together — so students improve with evidence, not guesswork.',
  );
  const future = pageText(
    pages,
    'about-future',
    'A larger, more personal recorded-learning ecosystem.',
    'The next chapter is better analytics, stronger career support and more programmes — still recorded-first.',
  );

  return (
    <main>
      <ScrollProgress />
      <AboutHero />
      <Mission title={mission.title} body={mission.body} />
      <Vision title={vision.title} body={vision.body} />
      <WhyGyanChowk />
      <LearningEcosystem />
      <Values />
      <PlatformFeatures />
      <Impact stats={stats} />
      <FutureVision title={future.title} body={future.body} />
      <AboutCTA />
    </main>
  );
}
