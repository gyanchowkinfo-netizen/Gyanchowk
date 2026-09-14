'use client';

import Link from 'next/link';
import { PageContainer } from '@/components/layout/Page';
import { AnimatedSection, MagneticButton, Parallax, Reveal, SoftBg } from '@/components/motion';

export function BatchCTA() {
  return (
    <AnimatedSection>
      <section className="relative overflow-hidden bg-gyan-cta text-white">
        <SoftBg />
        <PageContainer>
          <Parallax speed={0.1}>
            <div className="relative mx-auto max-w-2xl text-center">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.3em] text-gc-gold">Ready to start your preparation?</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-3 font-display text-3xl text-white md:text-5xl">Choose a structured learning path</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 text-white/80">
                  Start learning with Gyan Chowk recorded batches. Paid access unlocks only after Razorpay verification.
                </p>
              </Reveal>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Reveal delay={0.12}>
                  <MagneticButton href="#all-batches" variant="secondary">Explore batches</MagneticButton>
                </Reveal>
                <Reveal delay={0.16}>
                  <Link href="/courses" className="gc-btn-ghost-inverse">
                    Browse courses
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
