'use client';

import Link from 'next/link';
import { PageContainer } from '@/components/layout/Page';
import { AnimatedSection, FloatingElement, MagneticButton, Parallax, Reveal, SoftBg } from '@/components/motion';

export function CareerCTA() {
  return (
    <AnimatedSection>
      <section className="relative overflow-hidden bg-gyan-cta text-white">
        <SoftBg />
        <PageContainer>
          <Parallax speed={0.1}>
            <div className="relative mx-auto max-w-2xl text-center">
              <FloatingElement duration={5} className="pointer-events-none absolute -left-8 top-0 hidden md:block">
                <span className="gc-card px-3 py-2 text-xs">Roadmap</span>
              </FloatingElement>
              <FloatingElement duration={6} className="pointer-events-none absolute -right-4 bottom-4 hidden md:block">
                <span className="gc-card px-3 py-2 text-xs">Certificate</span>
              </FloatingElement>
              <Reveal>
                <p className="text-xs uppercase tracking-[0.3em] text-gc-gold">Start with direction</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-3 font-display text-3xl text-white md:text-5xl">Your future starts with the right direction.</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 text-white/80">
                  Use published roadmaps and recorded courses to move from learning to a clearer next step.
                </p>
              </Reveal>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Reveal delay={0.12}>
                  <MagneticButton href="#career-paths" variant="secondary">Explore Career Paths</MagneticButton>
                </Reveal>
                <Reveal delay={0.16}>
                  <Link href="/courses" className="gc-btn-ghost-inverse">
                    Start Learning
                  </Link>
                </Reveal>
              </div>
            </div>
          </Parallax>
        </PageContainer>
      </section>
    </AnimatedSection>
  );
}
