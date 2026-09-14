'use client';

import { PageContainer } from '@/components/layout/Page';
import { FloatingElement, Reveal, TextReveal } from '@/components/motion';

export function Mission({ title, body }: { title: string; body: string }) {
  const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
  return (
    <section id="mission" className="relative">
      <PageContainer>
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Our mission</p>
            </Reveal>
            <h2 className="mt-3 font-display text-3xl text-gc-black md:text-5xl">
              <TextReveal text={title} />
            </h2>
            <div className="mt-6 max-w-2xl space-y-4 text-lg text-gc-mist">
              {lines.map((line, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <p>{line}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="relative hidden min-h-[220px] lg:block">
            <FloatingElement duration={5} className="absolute left-8 top-6">
              <span className="gc-card px-3 py-2 text-sm">Open book</span>
            </FloatingElement>
            <FloatingElement duration={6} className="absolute right-4 top-24">
              <span className="gc-card px-3 py-2 text-sm">Learning path</span>
            </FloatingElement>
            <FloatingElement duration={4} className="absolute bottom-8 left-16">
              <span className="gc-card px-3 py-2 text-sm">Clarity</span>
            </FloatingElement>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
