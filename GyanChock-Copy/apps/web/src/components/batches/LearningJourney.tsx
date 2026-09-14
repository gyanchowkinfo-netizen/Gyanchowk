'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { BookOpen, ClipboardList, FileText, Flag, LineChart, PlayCircle, Search } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { useMotionPrefs } from '@/components/motion';

const steps = [
  { icon: Search, title: 'Choose your batch', body: 'Filter by exam, class and language. Enrollment still goes through checkout.' },
  { icon: PlayCircle, title: 'Learn through recorded lessons', body: 'HLS video, resume playback, enrollment-gated access.' },
  { icon: FileText, title: 'Study notes and materials', body: 'PDFs and notes unlock after payment verification.' },
  { icon: ClipboardList, title: 'Complete assignments', body: 'Published assignments with server-side evaluation.' },
  { icon: BookOpen, title: 'Take tests', body: 'Timed papers, negative marking and ranks — not DPP.' },
  { icon: LineChart, title: 'Track performance', body: 'Analytics and backlog from real attempts.' },
  { icon: Flag, title: 'Complete your learning goal', body: 'Certificates issue from server completion rules.' },
];

export function LearningJourney() {
  const { reduce } = useMotionPrefs();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.35'] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const height = useTransform(line, [0, 1], ['0%', '100%']);

  return (
    <section className="relative">
      <PageContainer>
        <h2 className="text-center font-display text-3xl text-gc-black">Your learning journey</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gc-mute">
          A recorded path from enrollment to certificate. Native scrolling — the timeline only reveals as you pass it.
        </p>
        <div ref={ref} className="relative mx-auto mt-10 max-w-2xl pl-8">
          <div className="absolute bottom-2 left-[11px] top-2 w-px bg-gc-line" aria-hidden />
          <motion.div
            className="absolute left-[11px] top-2 w-px origin-top bg-gradient-to-b from-gc-blue to-gc-gold"
            style={{ height: reduce ? '100%' : height }}
            aria-hidden
          />
          <ol className="space-y-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.title}
                  className="relative"
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.35, delay: reduce ? 0 : i * 0.04 }}
                >
                  <span className="absolute -left-8 top-3 grid h-6 w-6 place-items-center rounded-full border border-gc-gold bg-gc-navy text-gc-gold">
                    <Icon size={12} />
                  </span>
                  <article className="gc-card p-4">
                    <p className="text-xs text-gc-mute">Step {i + 1}</p>
                    <h3 className="mt-1 font-display text-lg text-gc-gold">{step.title}</h3>
                    <p className="mt-1 text-sm text-gc-mist">{step.body}</p>
                  </article>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </PageContainer>
    </section>
  );
}
