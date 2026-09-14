'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { PageContainer } from '@/components/layout/Page';
import { Reveal, useMotionPrefs } from '@/components/motion';

const steps = [
  { title: 'Better learning', body: 'Clearer recorded lessons, notes and practice loops.' },
  { title: 'Smarter analytics', body: 'Richer insight from real watch and attempt data.' },
  { title: 'More personalised education', body: 'Backlog and recommendations from what a student actually did.' },
  { title: 'Stronger career support', body: 'Deeper roadmaps, articles and faculty guidance.' },
  { title: 'Larger learning ecosystem', body: 'More courses, batches and teachers — still recorded-first.' },
];

export function FutureVision({ title, body }: { title: string; body: string }) {
  const { reduce } = useMotionPrefs();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.4'] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const height = useTransform(line, [0, 1], ['0%', '100%']);

  return (
    <section id="future">
      <PageContainer>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Where we&apos;re going</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="mt-2 font-display text-3xl text-gc-black">{title}</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-3 max-w-3xl text-gc-mist">{body}</p>
        </Reveal>
        <div ref={ref} className="relative mx-auto mt-10 max-w-2xl pl-8">
          <div className="absolute bottom-2 left-[11px] top-2 w-px bg-gc-line" aria-hidden />
          <motion.div
            className="absolute left-[11px] top-2 w-px origin-top bg-gradient-to-b from-gc-blue to-gc-gold"
            style={{ height: reduce ? '100%' : height }}
            aria-hidden
          />
          <ol className="space-y-5">
            {steps.map((step, i) => (
              <motion.li
                key={step.title}
                className="relative"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.35, delay: reduce ? 0 : i * 0.04 }}
              >
                <span className="absolute -left-8 top-4 h-3 w-3 rounded-full border border-gc-gold bg-gc-navy" />
                <article className="gc-card p-4">
                  <h3 className="font-display text-lg text-gc-gold">{step.title}</h3>
                  <p className="mt-1 text-sm text-gc-mist">{step.body}</p>
                </article>
              </motion.li>
            ))}
          </ol>
        </div>
      </PageContainer>
    </section>
  );
}
