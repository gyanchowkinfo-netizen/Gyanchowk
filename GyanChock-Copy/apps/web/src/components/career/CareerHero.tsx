'use client';

import Link from 'next/link';
import { PageContainer } from '@/components/layout/Page';
import { FloatingElement, MagneticButton, Parallax, Reveal, ScaleIn, SoftBg, TextReveal } from '@/components/motion';
import { CareerHeroVisual } from '@/components/3d/HeroVisual';

export function CareerHero() {
  return (
    <section className="relative overflow-hidden">
      <SoftBg />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,111,255,0.12),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
      <PageContainer>
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <Parallax speed={0.08}>
            <Reveal>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-gc-gold">Career guidance</p>
            </Reveal>
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
              <TextReveal text="Build Skills. Shape Your Future." />
            </h1>
            <Reveal delay={0.08}>
              <p className="mt-5 max-w-xl text-gc-mist">
                Explore career paths, learning roadmaps and practical resources designed to help you move from learning to
                opportunity.
              </p>
            </Reveal>
            <div className="mt-8 flex flex-wrap gap-3">
              <ScaleIn>
                <MagneticButton href="#career-paths">Explore Career Paths</MagneticButton>
              </ScaleIn>
              <Reveal delay={0.1}>
                <Link href="#roadmaps" className="gc-btn-ghost">
                  View Roadmaps
                </Link>
              </Reveal>
            </div>
          </Parallax>
          <Parallax speed={0.16} className="relative flex justify-center">
            <ScaleIn>
              <CareerHeroVisual />
            </ScaleIn>
            <FloatingElement duration={4} className="absolute left-0 top-8 hidden md:block">
              <span className="gc-card px-3 py-2 text-xs">Learn</span>
            </FloatingElement>
            <FloatingElement duration={5} className="absolute right-2 top-20 hidden md:block">
              <span className="gc-card px-3 py-2 text-xs">Skills</span>
            </FloatingElement>
            <FloatingElement duration={6} className="absolute bottom-10 left-8 hidden md:block">
              <span className="gc-card px-3 py-2 text-xs">Career</span>
            </FloatingElement>
          </Parallax>
        </div>
      </PageContainer>
    </section>
  );
}
