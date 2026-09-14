'use client';

import { PageContainer } from '@/components/layout/Page';
import { AnimatedSection, MagneticButton, Parallax, Reveal } from '@/components/motion';
import { SoftBg } from '@/components/motion';

export function BecomeTeacherCTA() {
  return (
    <AnimatedSection>
      <section className="relative overflow-hidden bg-gyan-cta text-white">
        <SoftBg />
        <PageContainer>
          <Parallax speed={0.1}>
            <div className="relative mx-auto max-w-2xl text-center">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.3em] text-gc-gold">Share your knowledge</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-3 font-display text-3xl text-white md:text-5xl">Become a Gyan Chowk teacher</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 text-white/80">
                  Teach with recorded lessons, tests and async doubts. Applications need admin approval — there is no public admin signup.
                </p>
              </Reveal>
              <div className="mt-8 flex justify-center">
                <Reveal delay={0.12}>
                  <MagneticButton href="/register?role=teacher" variant="secondary">Become a teacher</MagneticButton>
                </Reveal>
              </div>
            </div>
          </Parallax>
        </PageContainer>
      </section>
    </AnimatedSection>
  );
}
