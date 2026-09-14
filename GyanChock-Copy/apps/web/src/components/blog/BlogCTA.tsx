'use client';

import Link from 'next/link';
import { PageContainer } from '@/components/layout/Page';
import { AnimatedSection, FloatingElement, MagneticButton, Parallax, Reveal, SoftBg } from '@/components/motion';

export function BlogCTA() {
  return (
    <AnimatedSection>
      <section className="relative overflow-hidden bg-gyan-cta text-white">
        <SoftBg />
        <PageContainer>
          <Parallax speed={0.1}>
            <div className="relative mx-auto max-w-2xl text-center">
              <FloatingElement duration={5} className="pointer-events-none absolute -left-4 top-0 hidden md:block">
                <span className="gc-card px-3 py-2 text-xs">Notes</span>
              </FloatingElement>
              <FloatingElement duration={6} className="pointer-events-none absolute -right-2 bottom-2 hidden md:block">
                <span className="gc-card px-3 py-2 text-xs">Certificate</span>
              </FloatingElement>
              <Reveal>
                <h2 className="font-display text-3xl text-white md:text-5xl">Keep learning with Gyan Chowk</h2>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="mt-4 text-white/80">Move from reading to a structured recorded course or batch.</p>
              </Reveal>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Reveal delay={0.12}>
                  <MagneticButton href="/courses" variant="secondary">Explore Courses</MagneticButton>
                </Reveal>
                <Reveal delay={0.16}>
                  <Link href="/batches" className="gc-btn-ghost-inverse">
                    Explore Batches
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
