'use client';

import Link from 'next/link';
import { Briefcase, Compass, Map, Sparkles } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { Reveal, StaggerContainer, StaggerItem, TiltCard } from '@/components/motion';
import type { CareerCategory } from '@/lib/types';

export function CareerExplorer({
  categories,
  articleCount,
  roadmapCount,
  onCategory,
}: {
  categories: CareerCategory[];
  articleCount: number;
  roadmapCount: number;
  onCategory: (name: string) => void;
}) {
  return (
    <section id="explore" className="relative">
      <PageContainer>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Explore your future</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="mt-2 font-display text-3xl text-gc-black md:text-4xl">Find a direction that fits your learning</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-3 max-w-2xl text-sm text-gc-mute">
            Categories come from published career guides. Counts are real — we do not invent openings or salaries.
          </p>
        </Reveal>
        <StaggerContainer className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <StaggerItem key={cat.name}>
              <TiltCard intensity={4}>
                <button
                  type="button"
                  onClick={() => onCategory(cat.name)}
                  className="gc-card flex h-full w-full flex-col p-5 text-left hover:border-gc-gold"
                >
                  <Compass className="text-gc-gold" size={20} aria-hidden />
                  <h3 className="mt-3 font-display text-xl">{cat.name}</h3>
                  <p className="mt-2 text-sm text-gc-mute">
                    {cat.count} published guide{cat.count === 1 ? '' : 's'} in this category.
                  </p>
                  <span className="mt-4 text-sm text-gc-glow">Explore →</span>
                </button>
              </TiltCard>
            </StaggerItem>
          ))}
          <StaggerItem>
            <TiltCard intensity={4}>
              <Link href="#roadmaps" className="gc-card flex h-full flex-col p-5 hover:border-gc-gold">
                <Map className="text-gc-gold" size={20} aria-hidden />
                <h3 className="mt-3 font-display text-xl">Learning roadmaps</h3>
                <p className="mt-2 text-sm text-gc-mute">
                  {roadmapCount
                    ? `${roadmapCount} published roadmap${roadmapCount === 1 ? '' : 's'} with recorded-learning steps.`
                    : 'Structured recorded-learning paths when roadmaps are published.'}
                </p>
                <span className="mt-4 text-sm text-gc-glow">View roadmaps →</span>
              </Link>
            </TiltCard>
          </StaggerItem>
          <StaggerItem>
            <TiltCard intensity={4}>
              <Link href="#articles" className="gc-card flex h-full flex-col p-5 hover:border-gc-gold">
                <Briefcase className="text-gc-gold" size={20} aria-hidden />
                <h3 className="mt-3 font-display text-xl">Career articles</h3>
                <p className="mt-2 text-sm text-gc-mute">
                  {articleCount
                    ? `${articleCount} published article${articleCount === 1 ? '' : 's'} from the Gyan Chowk career desk.`
                    : 'Guides appear here as soon as the career desk publishes them.'}
                </p>
                <span className="mt-4 text-sm text-gc-glow">Read articles →</span>
              </Link>
            </TiltCard>
          </StaggerItem>
          <StaggerItem>
            <TiltCard intensity={4}>
              <Link href="/courses" className="gc-card flex h-full flex-col p-5 hover:border-gc-gold">
                <Sparkles className="text-gc-gold" size={20} aria-hidden />
                <h3 className="mt-3 font-display text-xl">Recorded courses</h3>
                <p className="mt-2 text-sm text-gc-mute">
                  Build the skills behind a career path through enrollment-gated recorded lessons.
                </p>
                <span className="mt-4 text-sm text-gc-glow">Explore courses →</span>
              </Link>
            </TiltCard>
          </StaggerItem>
        </StaggerContainer>
      </PageContainer>
    </section>
  );
}
