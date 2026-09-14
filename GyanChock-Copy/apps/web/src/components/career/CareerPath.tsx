'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { Award, BookOpen, Briefcase, ClipboardCheck, Flag, Hammer, LineChart, PlayCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { FloatingElement, Reveal, useMotionPrefs } from '@/components/motion';

const stages = [
  { icon: Flag, title: 'Start', body: 'Choose a subject, exam or skill you want to grow.' },
  { icon: PlayCircle, title: 'Learn', body: 'Study through recorded lessons at your own pace.' },
  { icon: BookOpen, title: 'Build skills', body: 'Use notes, materials and structured batches.' },
  { icon: Hammer, title: 'Practice', body: 'Assignments and tests turn watching into doing.' },
  { icon: LineChart, title: 'Projects', body: 'Applied work and reviews show what you can actually do.' },
  { icon: ClipboardCheck, title: 'Assessment', body: 'Timed papers, ranks and analytics from real attempts.' },
  { icon: Briefcase, title: 'Interview preparation', body: 'Career articles, mentorship and recorded revision.' },
  { icon: Award, title: 'Career', body: 'Certificates, roadmaps and the next opportunity.' },
];

export function CareerPath() {
  const { reduce } = useMotionPrefs();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.35'] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const height = useTransform(line, [0, 1], ['0%', '100%']);

  return (
    <section id="career-paths" className="relative">
      <PageContainer>
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Choose your career path</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="mt-2 text-center font-display text-3xl text-gc-black md:text-4xl">From learning to opportunity</h2>
        </Reveal>
        <div className="relative mx-auto mt-10 max-w-2xl">
          <FloatingElement duration={5} className="pointer-events-none absolute -right-4 top-8 hidden lg:block">
            <span className="gc-card px-3 py-2 text-xs">Certificate</span>
          </FloatingElement>
          <FloatingElement duration={6} className="pointer-events-none absolute -left-6 bottom-16 hidden lg:block">
            <span className="gc-card px-3 py-2 text-xs">Roadmap</span>
          </FloatingElement>
          <div ref={ref} className="relative pl-8">
            <div className="absolute bottom-2 left-[11px] top-2 w-px bg-gc-line" aria-hidden />
            <motion.div
              className="absolute left-[11px] top-2 w-px origin-top bg-gradient-to-b from-gc-blue to-gc-gold"
              style={{ height: reduce ? '100%' : height }}
              aria-hidden
            />
            <ol className="space-y-6">
              {stages.map((stage, i) => {
                const Icon = stage.icon;
                return (
                  <motion.li
                    key={stage.title}
                    className="relative"
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.04 }}
                  >
                    <span className="absolute -left-8 top-3 grid h-6 w-6 place-items-center rounded-full border border-gc-gold bg-gc-navy text-gc-gold">
                      <Icon size={12} />
                    </span>
                    <article className="gc-card p-4">
                      <p className="text-xs text-gc-mute">Stage {i + 1}</p>
                      <h3 className="mt-1 font-display text-lg text-gc-gold">{stage.title}</h3>
                      <p className="mt-1 text-sm text-gc-mist">{stage.body}</p>
                    </article>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
