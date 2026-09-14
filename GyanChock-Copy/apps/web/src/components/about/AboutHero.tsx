'use client';

import Link from 'next/link';
import { PageContainer } from '@/components/layout/Page';
import { FloatingElement, MagneticButton, Parallax, Reveal, ScaleIn, SoftBg, TextReveal } from '@/components/motion';
import { AboutHeroVisual } from '@/components/3d/HeroVisual';

export function AboutHero() {
  return (
    <section className="relative overflow-hidden">
      <SoftBg />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,111,255,0.12),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
      <PageContainer>
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <Parallax speed={0.08}>
            <Reveal>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-gc-gold">About Gyan Chowk</p>
            </Reveal>
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
              <TextReveal text="Learning Should Have No Limits." />
            </h1>
            <Reveal delay={0.08}>
              <p className="mt-5 max-w-xl text-gc-mist">
                Gyan Chowk is building a structured learning ecosystem that helps students learn, practice, improve and move
                toward their goals.
              </p>
            </Reveal>
            <div className="mt-8 flex flex-wrap gap-3">
              <ScaleIn>
                <MagneticButton href="#ecosystem">Explore Gyan Chowk</MagneticButton>
              </ScaleIn>
              <Reveal delay={0.1}>
                <Link href="/courses" className="gc-btn-ghost">
                  Explore Courses
                </Link>
              </Reveal>
            </div>
          </Parallax>
          <Parallax speed={0.16} className="relative flex justify-center">
            <ScaleIn>
              <AboutHeroVisual />
            </ScaleIn>
            <FloatingElement duration={5} className="absolute left-0 top-8 hidden md:block">
              <span className="gc-card px-3 py-2 text-xs">Courses</span>
            </FloatingElement>
            <FloatingElement duration={4} className="absolute right-2 top-20 hidden md:block">
              <span className="gc-card px-3 py-2 text-xs">Tests</span>
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
