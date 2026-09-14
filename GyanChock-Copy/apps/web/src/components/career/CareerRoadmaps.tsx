'use client';

import Link from 'next/link';
import { PageContainer } from '@/components/layout/Page';
import { EmptyState } from '@/components/ui/States';
import { Reveal, StaggerContainer, StaggerItem, TiltCard } from '@/components/motion';
import type { CareerRoadmap } from '@/lib/types';

export function CareerRoadmaps({ items, loading }: { items: CareerRoadmap[]; loading?: boolean }) {
  return (
    <section id="roadmaps">
      <PageContainer>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Roadmaps</p>
            </Reveal>
            <Reveal delay={0.04}>
              <h2 className="mt-2 font-display text-3xl text-gc-black">Structured learning maps</h2>
            </Reveal>
          </div>
          <Link href="/career/roadmaps" className="text-sm text-gc-glow hover:underline">
            View all roadmaps
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="gc-card h-32 animate-pulse" />
            <div className="gc-card h-32 animate-pulse" />
          </div>
        ) : items.length ? (
          <StaggerContainer className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <StaggerItem key={item.slug}>
                <TiltCard intensity={4}>
                  <Link href={`/career/roadmaps/${item.slug}`} className="gc-card block h-full p-5 hover:border-gc-gold">
                    <h3 className="font-display text-xl">{item.title}</h3>
                    {item.description ? <p className="mt-2 text-sm text-gc-mute">{item.description}</p> : null}
                    <p className="mt-4 text-sm text-gc-glow">
                      {item.steps?.length ? `${item.steps.length} steps` : 'Open roadmap'} →
                    </p>
                  </Link>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <EmptyState title="No roadmaps published yet" body="When the career desk publishes a roadmap, it will appear here." />
        )}
      </PageContainer>
    </section>
  );
}
