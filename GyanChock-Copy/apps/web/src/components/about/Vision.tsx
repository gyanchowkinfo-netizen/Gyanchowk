'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { Award, BookOpen, Flag, Sparkles, Target } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { Reveal, useMotionPrefs } from '@/components/motion';

const stages = [
  { icon: Flag, title: 'Student', body: 'Every journey starts with a learner and a goal.' },
  { icon: BookOpen, title: 'Learning', body: 'Recorded lessons, notes and structured batches.' },
  { icon: Target, title: 'Skills', body: 'Practice through tests, assignments and doubts.' },
  { icon: Sparkles, title: 'Confidence', body: 'Analytics and ranks from real attempts, not guesses.' },
  { icon: Award, title: 'Opportunity', body: 'Certificates, career maps and the next step forward.' },
];

export function Vision({ title, body }: { title: string; body: string }) {
  const { reduce } = useMotionPrefs();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.4'] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const width = useTransform(line, [0, 1], ['0%', '100%']);

  return (
    <section id="vision">
      <PageContainer>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Our vision</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="mt-2 font-display text-3xl text-gc-black md:text-4xl">{title}</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-4 max-w-3xl text-gc-mist">{body}</p>
        </Reveal>
        <div ref={ref} className="relative mt-10">
          <div className="absolute left-0 right-0 top-5 hidden h-px bg-gc-line md:block" aria-hidden />
          <motion.div
            className="absolute left-0 top-5 hidden h-px origin-left bg-gradient-to-r from-gc-blue to-gc-gold md:block"
            style={{ width: reduce ? '100%' : width }}
            aria-hidden
          />
          <ol className="grid gap-4 md:grid-cols-5">
            {stages.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <motion.li
                  key={stage.title}
                  className="gc-card p-4"
                  initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.05 }}
                >
                  <Icon className="text-gc-gold" size={18} aria-hidden />
                  <h3 className="mt-3 font-display text-lg text-gc-gold">{stage.title}</h3>
                  <p className="mt-2 text-sm text-gc-mute">{stage.body}</p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </PageContainer>
    </section>
  );
}
