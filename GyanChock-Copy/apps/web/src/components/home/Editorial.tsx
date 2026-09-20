'use client';

import { Reveal } from '@/components/motion';
import { SectionHeading } from './SectionHeading';
import { OUTCOMES } from './content';

export function Outcomes() {
  return (
    <section className="gc-container py-14 md:py-20" aria-labelledby="outcomes">
      <SectionHeading id="outcomes" kicker="Why it works" title="Built around outcomes." align="center" />
      <div className="grid gap-10 md:grid-cols-4">
        {OUTCOMES.map((o, i) => (
          <Reveal key={o.title} delay={i * 0.05}>
            <article>
              <p className="font-display text-3xl text-gc-black">{o.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-gc-mute">{o.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
