'use client';

import Link from 'next/link';
import { PageContainer } from '@/components/layout/Page';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion';

const nodes = [
  { name: 'Courses', href: '/courses' },
  { name: 'Batches', href: '/batches' },
  { name: 'Teachers', href: '/teachers' },
  { name: 'Students', href: '/register' },
  { name: 'Study materials', href: '/courses' },
  { name: 'Tests', href: '/batches' },
  { name: 'Assignments', href: '/batches' },
  { name: 'Doubts', href: '/about#why' },
  { name: 'Analytics', href: '/about#why' },
  { name: 'Career', href: '/career' },
];

export function LearningEcosystem() {
  return (
    <section id="ecosystem">
      <PageContainer>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Learning ecosystem</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="mt-2 text-center font-display text-3xl text-gc-black md:text-4xl">One hub. Connected learning.</h2>
        </Reveal>
        <div className="relative mx-auto mt-12 max-w-4xl">
          <div className="pointer-events-none absolute inset-8 rounded-full border border-gc-line/70" aria-hidden />
          <div className="relative z-10 mx-auto mb-10 grid place-items-center">
            <div className="gc-card px-8 py-6 text-center shadow-glow">
              <p className="text-xs uppercase tracking-[0.3em] text-gc-gold">Hub</p>
              <p className="mt-2 font-display text-2xl">Gyan Chowk</p>
            </div>
          </div>
          <StaggerContainer className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {nodes.map((node) => (
              <StaggerItem key={node.name}>
                <Link href={node.href} className="gc-card block p-4 text-center text-sm hover:border-gc-gold">
                  {node.name}
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </PageContainer>
    </section>
  );
}
